import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

const extended = z.object({
  pageType: z.enum(['overview', 'install', 'network', 'app', 'recovery', 'troubleshoot']).default('overview'),
  tested: z.boolean().default(false),
  testedVersions: z.array(z.string()).default([]),
  evidenceLevel: z.enum(['E1', 'E2', 'E3']).optional(),
  aliases: z.array(z.string()).default([]),
  symptoms: z.array(z.string()).default([]),
});

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({ extend: extended }),
  }),
};
