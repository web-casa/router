export interface LocaleInfo {
  /** Native name shown in the language picker. */
  label: string;
  /** BCP-47 tag Starlight puts in `<html lang>` and hreflang. */
  lang: string;
  /** Locale code in the LuCI repository (`modules/luci-base/po/<code>`). */
  luciPo?: string;
}

/** Every locale the fleet knows how to build. A site opts in through `fleet.config.json`. */
export const LOCALE_CATALOG: Record<string, LocaleInfo> = {
  en: { label: 'English', lang: 'en' },
  zh: { label: '简体中文', lang: 'zh-CN', luciPo: 'zh_Hans' },
  'zh-hant': { label: '繁體中文', lang: 'zh-Hant', luciPo: 'zh_Hant' },
  ja: { label: '日本語', lang: 'ja', luciPo: 'ja' },
  es: { label: 'Español', lang: 'es', luciPo: 'es' },
  de: { label: 'Deutsch', lang: 'de', luciPo: 'de' },
  fr: { label: 'Français', lang: 'fr', luciPo: 'fr' },
};

export function getLocaleInfo(locale: string): LocaleInfo {
  const info = LOCALE_CATALOG[locale];
  if (!info) throw new Error(`Unknown locale "${locale}"; add it to LOCALE_CATALOG`);
  return info;
}

/** Starlight `locales` option for the given locale codes. */
export function starlightLocales(locales: string[]): Record<string, { label: string; lang: string }> {
  return Object.fromEntries(
    locales.map((code) => {
      const { label, lang } = getLocaleInfo(code);
      return [code, { label, lang }];
    }),
  );
}
