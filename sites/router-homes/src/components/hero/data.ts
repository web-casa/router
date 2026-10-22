import { getCollection } from 'astro:content';
import { pick, localeLang } from '../../i18n';

export const HERO_VARIANTS = ['signal', 'console', 'release', 'panel', 'rings', 'download'] as const;
export type HeroVariant = (typeof HERO_VARIANTS)[number];

export type HeroAction = { link: string; text: string; variant?: string };
export type HeroWord = { text: string; em: boolean; space: boolean };

export interface HeroData {
  locale: string;
  words: HeroWord[];
  tagline?: string;
  actions: HeroAction[];
  eyebrow: string;
  release: string;
  stats: [string, string][];
  /** Sidebar guide labels and links, for variants that list topics. */
  guides: { label: string; href: string }[];
}

/** Split a hero title into words; `<em>…</em>` marks the accented phrase. */
export function splitTitle(title: string): HeroWord[] {
  const words: HeroWord[] = [];
  for (const part of title.split(/(<em>.*?<\/em>)/)) {
    if (!part) continue;
    const em = part.startsWith('<em>');
    const text = part.replace(/<\/?em>/g, '');
    // A part that starts with whitespace ("<em>Ihr Netzwerk</em> zu") owes that space to the previous word.
    if (/^\s/.test(text) && words.length) words[words.length - 1].space = true;
    for (const w of text.split(/(?<=[\s，、])/)) if (w.trim()) words.push({ text: w.trim(), em, space: /\s$/.test(w) });
  }
  return words;
}

export async function getHeroData(
  locale: string,
  hero: { title?: string; tagline?: string; actions?: HeroAction[] },
  sidebar: { label?: string; translations?: Record<string, string>; slug?: string; items?: any[] }[]
): Promise<HeroData> {
  const docs = (await getCollection('docs')).filter(
    (d) => d.id.startsWith(`${locale}/`) && d.data.template !== 'splash' && !d.id.includes('/features/')
  );
  const lab = docs.filter((d) => d.data.evidenceLevel === 'E2' || d.data.evidenceLevel === 'E3').length;
  // Only OpenWrt release numbers (YY.MM.x); package versions also live in testedVersions.
  const versions = [
    ...new Set(docs.flatMap((d) => d.data.testedVersions).filter((v) => /^\d{2}\.\d{2}(\.\d+)?$/.test(v))),
  ].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  const lastVerified = docs.map((d) => d.data.lastVerifiedAt).filter(Boolean).sort().at(-1);
  const release = versions[0] ?? '25.12';
  const lang = localeLang(locale);
  const label = (item: { label?: string; translations?: Record<string, string> }) =>
    (lang === 'en' ? item.label : item.translations?.[lang] ?? item.label) ?? '';
  const guides = sidebar
    .flatMap((g) => g.items ?? [])
    .filter((p) => p.slug && !p.slug.startsWith('features/') && p.slug !== 'getting-started/overview')
    .map((p) => ({ label: label(p), href: `/${locale}/${p.slug}/` }));

  return {
    locale,
    words: splitTitle(String(hero.title ?? '')),
    tagline: hero.tagline,
    actions: hero.actions ?? [],
    eyebrow: pick(locale, { en: `Tested against OpenWrt ${release}`, zh: `按 OpenWrt ${release} 实验复现`, 'zh-hant': `依 OpenWrt ${release} 實驗重現`, ja: `OpenWrt ${release} で検証`, es: `Probado con OpenWrt ${release}`, de: `Getestet mit OpenWrt ${release}`, fr: `Testé avec OpenWrt ${release}` }),
    release,
    guides,
    stats: pick<[string, string][]>(locale, {
      en: [
          [String(docs.length), 'guides, each in English and Chinese'],
          [String(lab), 'reproduced step by step in a lab VM'],
          [versions.slice(0, 2).join(' / ') || '—', versions.length > 1 ? 'OpenWrt releases in the lab' : 'OpenWrt release in the lab'],
          [lastVerified ?? '—', 'last lab verification'],
        ],
      zh: [
          [String(docs.length), '篇操作页，中英成对'],
          [String(lab), '篇在实验 VM 中逐步复现'],
          [versions.slice(0, 2).join(' / ') || '—', '实验所用 OpenWrt 版本'],
          [lastVerified ?? '—', '最近一次实验验证'],
        ],
      es: [
          [String(docs.length), 'guías, en varios idiomas'],
          [String(lab), 'reproducidas paso a paso en una VM de laboratorio'],
          [versions.slice(0, 2).join(' / ') || '—', versions.length > 1 ? 'versiones de OpenWrt en el laboratorio' : 'versión de OpenWrt en el laboratorio'],
          [lastVerified ?? '—', 'última verificación en laboratorio'],
        ],
      de: [
          [String(docs.length), 'Anleitungen, in mehreren Sprachen'],
          [String(lab), 'Schritt für Schritt in einer Labor-VM nachgestellt'],
          [versions.slice(0, 2).join(' / ') || '—', versions.length > 1 ? 'OpenWrt-Releases im Labor' : 'OpenWrt-Release im Labor'],
          [lastVerified ?? '—', 'letzte Laborprüfung'],
        ],
      fr: [
          [String(docs.length), 'guides, en plusieurs langues'],
          [String(lab), 'reproduits pas à pas dans une VM de laboratoire'],
          [versions.slice(0, 2).join(' / ') || '—', versions.length > 1 ? 'versions d’OpenWrt en laboratoire' : 'version d’OpenWrt en laboratoire'],
          [lastVerified ?? '—', 'dernière vérification en laboratoire'],
        ],
      ja: [
          [String(docs.length), '本のガイド、複数の言語で提供'],
          [String(lab), '本をラボ VM で手順どおりに再現'],
          [versions.slice(0, 2).join(' / ') || '—', 'ラボで使用した OpenWrt のバージョン'],
          [lastVerified ?? '—', '直近のラボ検証'],
        ],
      'zh-hant': [
          [String(docs.length), '篇操作頁，另有各語言版本'],
          [String(lab), '篇已在實驗 VM 中逐步重現'],
          [versions.slice(0, 2).join(' / ') || '—', '實驗所用的 OpenWrt 版本'],
          [lastVerified ?? '—', '最近一次實驗驗證'],
        ],
    }),
  };
}
