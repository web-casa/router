import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

const extended = z.object({
  pageType: z.enum(['overview', 'install', 'network', 'app', 'recovery', 'troubleshoot']).default('overview'),
  tested: z.boolean().default(false),
  testedVersions: z.array(z.string()).default([]),
  evidenceLevel: z.enum(['E1', 'E2', 'E3']).optional(),
  testEnvironment: z.string().optional(),
  testRecipe: z.string().optional(),
  lastVerifiedAt: z.string().optional(),
  aliases: z.array(z.string()).default([]),
  symptoms: z.array(z.string()).default([]),
  heroVariant: z.enum(['signal', 'console', 'release', 'panel', 'rings', 'download']).optional(),
  // Translations only: fingerprint of the default-locale page this file was translated from (see `pnpm i18n stamp`).
  sourceHash: z.string().regex(/^[0-9a-f]{16}$/).optional(),
  sources: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
});

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({ extend: extended }),
  }),
};
