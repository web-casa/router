import { getCollection } from 'astro:content';

export const HERO_VARIANTS = ['signal', 'console', 'release', 'panel', 'rings', 'download'] as const;
export type HeroVariant = (typeof HERO_VARIANTS)[number];

export type HeroAction = { link: string; text: string; variant?: string };
export type HeroWord = { text: string; em: boolean; space: boolean };

export interface HeroData {
  locale: string;
  isEn: boolean;
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
    for (const w of text.split(/(?<=[\s，、])/)) if (w.trim()) words.push({ text: w.trim(), em, space: /\s$/.test(w) });
  }
  return words;
}

export async function getHeroData(
  locale: string,
  hero: { title?: string; tagline?: string; actions?: HeroAction[] },
  sidebar: { label?: string; translations?: Record<string, string>; slug?: string; items?: any[] }[]
): Promise<HeroData> {
  const isEn = locale === 'en';
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
  const lang = isEn ? 'en' : 'zh-CN';
  const label = (item: { label?: string; translations?: Record<string, string> }) =>
    (isEn ? item.label : item.translations?.[lang] ?? item.label) ?? '';
  const guides = sidebar
    .flatMap((g) => g.items ?? [])
    .filter((p) => p.slug && !p.slug.startsWith('features/') && p.slug !== 'getting-started/overview')
    .map((p) => ({ label: label(p), href: `/${locale}/${p.slug}/` }));

  return {
    locale,
    isEn,
    words: splitTitle(String(hero.title ?? '')),
    tagline: hero.tagline,
    actions: hero.actions ?? [],
    eyebrow: isEn ? `Tested against OpenWrt ${release}` : `按 OpenWrt ${release} 实验复现`,
    release,
    guides,
    stats: isEn
      ? [
          [String(docs.length), 'guides, each in English and Chinese'],
          [String(lab), 'reproduced step by step in a lab VM'],
          [versions.slice(0, 2).join(' / ') || '—', versions.length > 1 ? 'OpenWrt releases in the lab' : 'OpenWrt release in the lab'],
          [lastVerified ?? '—', 'last lab verification'],
        ]
      : [
          [String(docs.length), '篇操作页，中英成对'],
          [String(lab), '篇在实验 VM 中逐步复现'],
          [versions.slice(0, 2).join(' / ') || '—', '实验所用 OpenWrt 版本'],
          [lastVerified ?? '—', '最近一次实验验证'],
        ],
  };
}
