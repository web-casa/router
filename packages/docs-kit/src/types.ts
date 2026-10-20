import { z } from 'zod';

export const DeploySchema = z.object({
  enabled: z.boolean().default(false),
  project: z.string().min(1),
  domainStatus: z.enum(['unbound', 'placeholder-deployed', 'binding', 'verified', 'live', 'redirected-hosts']).default('unbound'),
});

export const SiteConfigSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/),
  domain: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  defaultLocale: z.string().default('en'),
  locales: z.array(z.string()).min(1).default(['en', 'zh']),
  audience: z.string().min(1),
  angle: z.string().min(1),
  minPages: z.number().int().positive().default(4),
  approvalMode: z.enum(['solo', 'second-person']).default('solo'),
  theme: z.string().default('router'),
  deploy: DeploySchema,
});

export const FleetConfigSchema = z.object({
  version: z.number().int().positive(),
  sites: z.array(SiteConfigSchema).min(1),
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type FleetConfig = z.infer<typeof FleetConfigSchema>;

export interface SidebarItem {
  label?: string;
  translations?: Record<string, string>;
  slug?: string;
  link?: string;
  collapsed?: boolean;
  items?: SidebarItem[];
  autogenerate?: { directory: string };
}

export interface SiteMeta extends SiteConfig {
  sidebar: SidebarItem[];
  customCss?: string[];
  components?: Record<string, string>;
}

export function parseFleetConfig(input: unknown): FleetConfig {
  return FleetConfigSchema.parse(input);
}

export function getSite(config: FleetConfig, id: string): SiteConfig {
  const site = config.sites.find((item) => item.id === id);
  if (!site) throw new Error(`Site "${id}" not found in fleet config`);
  return site;
}
