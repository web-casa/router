// Component copy lookup for N locales. No fallback: a locale without copy
// is a build error, not a silently English page (project rule: no fallback).

export function pick<T>(locale: string, copy: { en: T; zh: T } & Record<string, T>): T {
  if (!Object.hasOwn(copy, locale)) throw new Error(`Missing UI copy for locale "${locale}"`);
  return copy[locale];
}

const LANG: Record<string, string> = {
  en: 'en',
  zh: 'zh-CN',
  'zh-hant': 'zh-Hant',
  ja: 'ja',
  es: 'es',
  de: 'de',
  fr: 'fr',
};

/** Locale code -> BCP-47 tag, the key of Starlight sidebar `translations`. */
export function localeLang(locale: string): string {
  const lang = LANG[locale];
  if (!lang) throw new Error(`Unknown locale "${locale}"`);
  return lang;
}
