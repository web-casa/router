import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import { starlightLocales } from './locales.js';
import type { SiteMeta } from './types.js';

export interface CreateDocsConfigOptions {
  alias?: Record<string, string>;
}

export function createDocsConfig(meta: SiteMeta, options: CreateDocsConfigOptions = {}) {
  const domain = meta.domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return defineConfig({
    site: `https://${domain}`,
    trailingSlash: 'always',
    integrations: [
      starlight({
        title: meta.title,
        description: meta.description,
        defaultLocale: meta.defaultLocale,
        locales: starlightLocales(meta.locales),
        sidebar: meta.sidebar as any,
        customCss: meta.customCss ?? ['./src/styles/theme.css'],
        social: [],
        lastUpdated: true,
        pagination: true,
        ...(meta.components ? { components: meta.components } : {}),
        ...(meta.starlight ?? {}),
      }),
    ],
    vite: {
      resolve: {
        alias: options.alias ?? {},
      },
    },
  });
}
