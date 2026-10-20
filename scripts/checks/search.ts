import { createServer } from 'node:http';
import { access, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';

const root = path.resolve('sites/router-homes/dist');
const contractPath = path.resolve('tests/search/queries.json');
const negativePath = path.resolve('tests/search/negative.json');
const reportPath = path.resolve('tests/search/last-run.json');
const executablePath = process.env.CHROME_PATH || '/usr/bin/chromium';

interface QueryCase {
  id: string;
  locale: 'zh' | 'en';
  query: string;
  expectedUrls: string[];
  category: string;
  aliasCase: boolean;
}

interface Contract {
  version: number;
  topK: number;
  queries: QueryCase[];
}

interface NegativeCase {
  id: string;
  locale: 'zh' | 'en';
  query: string;
  category: string;
  expectEmpty: boolean;
  forbiddenUrls: string[];
  rationale?: string;
}

interface NegativeContract {
  version: number;
  topK: number;
  queries: NegativeCase[];
}

interface NegativeResult extends NegativeCase {
  results: RawResult[];
  passed: boolean;
}

const contract = JSON.parse(await readFile(contractPath, 'utf8')) as Contract;
if (contract.version !== 1) throw new Error(`unsupported contract version: ${contract.version}`);
if (contract.queries.length < 40) throw new Error(`expected at least 40 queries, got ${contract.queries.length}`);
if (new Set(contract.queries.map((q) => q.id)).size !== contract.queries.length) {
  throw new Error('query ids must be unique');
}
for (const q of contract.queries) {
  if (!['zh', 'en'].includes(q.locale)) throw new Error(`${q.id}: bad locale`);
  if (!q.expectedUrls.length) throw new Error(`${q.id}: expectedUrls empty`);
}

const negativeContract = JSON.parse(await readFile(negativePath, 'utf8')) as NegativeContract;
if (negativeContract.version !== 1) throw new Error(`unsupported negative contract version: ${negativeContract.version}`);
if (negativeContract.queries.length !== 5) throw new Error(`expected 5 negative queries, got ${negativeContract.queries.length}`);
if (new Set(negativeContract.queries.map((q) => q.id)).size !== negativeContract.queries.length) {
  throw new Error('negative query ids must be unique');
}
for (const q of negativeContract.queries) {
  if (!['zh', 'en'].includes(q.locale)) throw new Error(`${q.id}: bad locale`);
  if (!q.expectEmpty && !q.forbiddenUrls.length) {
    throw new Error(`${q.id}: negative query needs expectEmpty or forbiddenUrls`);
  }
}
if (new Set(contract.queries.map((q) => q.id)).size !== contract.queries.length) {
  throw new Error('query ids must be unique');
}
for (const q of contract.queries) {
  if (!['zh', 'en'].includes(q.locale)) throw new Error(`${q.id}: bad locale`);
  if (!q.expectedUrls.length) throw new Error(`${q.id}: expectedUrls empty`);
}

await access(path.join(root, 'pagefind/pagefind.js')).catch(() => {
  throw new Error(`missing ${root}/pagefind/pagefind.js; run pnpm build first`);
});
await access(executablePath).catch(() => {
  throw new Error(`Chromium not found at ${executablePath}; set CHROME_PATH`);
});

const mime: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.pf_meta': 'application/octet-stream',
  '.pf_fragment': 'application/octet-stream',
  '.pf_index': 'application/octet-stream',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = path.resolve(root, `.${pathname}`);
    const rel = path.relative(root, file);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      res.writeHead(403);
      res.end('forbidden');
      return;
    }
    const info = await stat(file).catch(() => null);
    if (!info?.isFile()) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(await readFile(file));
  } catch (error) {
    res.writeHead(500);
    res.end(String(error));
  }
});

await new Promise<void>((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const address = server.address();
if (!address || typeof address === 'string') throw new Error('failed to bind static server');
const base = `http://127.0.0.1:${address.port}`;

function normalizeUrl(raw: string): string {
  try {
    const parsed = new URL(raw, base);
    let p = parsed.pathname;
    p = p.replace(/index\.html$/, '');
    if (!p.endsWith('/')) p += '/';
    return p;
  } catch {
    return raw;
  }
}

interface RawResult {
  url: string;
  title: string;
  excerpt: string;
}

interface CaseResult {
  id: string;
  locale: string;
  query: string;
  category: string;
  aliasCase: boolean;
  expectedUrls: string[];
  rank: number | null;
  results: RawResult[];
}

let browser: Browser | null = null;
const results: CaseResult[] = [];
const negativeResults: NegativeResult[] = [];

try {
  browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  const pages = new Map<string, Page>();
  for (const locale of ['zh', 'en']) {
    const page = await browser.newPage();
    await page.goto(`${base}/${locale}/`, { waitUntil: 'domcontentloaded' });
    pages.set(locale, page);
  }

  for (const page of pages.values()) {
    await page.waitForSelector('button[data-open-modal]:not([disabled])');
    await page.locator('button[data-open-modal]').click();
    await page.locator('.pagefind-ui__search-input').waitFor({ state: 'visible' });
  }

  for (const q of contract.queries) {
    const page = pages.get(q.locale);
    if (!page) throw new Error(`no page for locale ${q.locale}`);

    const input = page.locator('.pagefind-ui__search-input');
    await input.fill('');
    await page.waitForTimeout(80);
    await input.fill(q.query);
    await page.waitForTimeout(700);

    const raw = await page.locator('.pagefind-ui__result-link').evaluateAll((els) =>
      els.map((el) => ({
        url: String(el.getAttribute('href') || ''),
        title: String(el.textContent || '').trim(),
        excerpt: '',
      })),
    );

    const seen = new Set<string>();
    const top = (raw as RawResult[])
      .filter((r) => {
        const key = normalizeUrl(r.url);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, contract.topK);
    const expected = q.expectedUrls.map(normalizeUrl);
    const rank = top.findIndex((r) => expected.includes(normalizeUrl(r.url)));
    const result: CaseResult = {
      id: q.id,
      locale: q.locale,
      query: q.query,
      category: q.category,
      aliasCase: q.aliasCase,
      expectedUrls: q.expectedUrls,
      rank: rank >= 0 ? rank + 1 : null,
      results: top,
    };
    results.push(result);

    if (result.rank === null) {
      console.error(`FAIL ${q.id} [${q.locale}] ${q.query}`);
      for (const [i, r] of top.entries()) {
        console.error(`  ${i + 1}. ${r.title} ${r.url}`);
      }
    } else {
      console.log(`ok ${q.id} rank=${result.rank} [${q.locale}] ${q.query}`);
    }
  }

  for (const q of negativeContract.queries) {
    const page = pages.get(q.locale);
    if (!page) throw new Error(`no page for locale ${q.locale}`);

    const input = page.locator('.pagefind-ui__search-input');
    await input.fill('');
    await page.waitForTimeout(80);
    await input.fill(q.query);
    await page.waitForTimeout(700);

    const raw = await page.locator('.pagefind-ui__result-link').evaluateAll((els) =>
      els.map((el) => ({
        url: String(el.getAttribute('href') || ''),
        title: String(el.textContent || '').trim(),
        excerpt: '',
      })),
    );

    const seen = new Set<string>();
    const top = (raw as RawResult[])
      .filter((r) => {
        const key = normalizeUrl(r.url);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, negativeContract.topK);

    const forbidden = q.forbiddenUrls.map(normalizeUrl);
    const forbiddenHit = top.find((r) => forbidden.includes(normalizeUrl(r.url)));
    const passed = q.expectEmpty ? top.length === 0 : !forbiddenHit;
    const result: NegativeResult = { ...q, results: top, passed };
    negativeResults.push(result);

    if (!result.passed) {
      console.error(`FAIL ${q.id} [${q.locale}] ${q.expectEmpty ? 'expected empty' : 'forbidden result'}: ${q.query}`);
      for (const [i, r] of top.entries()) {
        console.error(`  ${i + 1}. ${r.title} ${r.url}`);
      }
    } else {
      console.log(`ok ${q.id} ${q.expectEmpty ? 'empty' : 'forbidden-absent'} [${q.locale}] ${q.query}`);
    }
  }

  for (const page of pages.values()) await page.close();
} finally {
  if (browser) await browser.close();
  await new Promise<void>((resolve) => server.close(() => resolve()));
}

const failed = results.filter((r) => r.rank === null);
const aliasCases = results.filter((r) => r.aliasCase);
const failedNegative = negativeResults.filter((r) => !r.passed);
const report = {
  generatedAt: new Date().toISOString(),
  base,
  topK: contract.topK,
  positive: {
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    aliasCases: {
      total: aliasCases.length,
      passed: aliasCases.filter((r) => r.rank !== null).length,
    },
    results,
  },
  negative: {
    total: negativeResults.length,
    passed: negativeResults.length - failedNegative.length,
    failed: failedNegative.length,
    results: negativeResults,
  },
};

await mkdir(path.dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

console.log('');
console.log(`positive queries: ${report.positive.passed}/${report.positive.total} passed, ${report.positive.failed} failed`);
console.log(`negative queries: ${report.negative.passed}/${report.negative.total} passed, ${report.negative.failed} failed`);
console.log(`alias cases: ${report.positive.aliasCases.passed}/${report.positive.aliasCases.total}`);
console.log(`report: ${path.relative(process.cwd(), reportPath)}`);

if (failed.length) {
  console.error('\nfailed positive queries:');
  for (const f of failed) console.error(`- ${f.id} [${f.locale}] ${f.query}`);
}
if (failedNegative.length) {
  console.error('\nnegative queries with unexpected results:');
  for (const f of failedNegative) console.error(`- ${f.id} [${f.locale}] ${f.query}`);
}
if (failed.length || failedNegative.length) process.exitCode = 1;
