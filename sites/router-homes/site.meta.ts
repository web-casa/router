import type { SiteMeta } from '@fleet/docs-kit';
import fleet from '../../fleet.config.json';

const base = fleet.sites.find((site) => site.id === 'router-homes');
if (!base) throw new Error('router-homes missing from fleet.config.json');

const meta = {
  ...base,
  customCss: ['./src/styles/theme.css'],
  sidebar: [
    {
      label: 'Getting Started',
      translations: { zh: '开始' },
      items: [
        {
          label: 'Overview',
          translations: { zh: '概览' },
          slug: 'getting-started/overview',
        },
      ],
    },
    {
      label: 'Network',
      translations: { zh: '网络' },
      items: [
        {
          label: 'DNS',
          translations: { zh: 'DNS 设置' },
          slug: 'network/dns',
        },
      ],
    },
    {
      label: 'Installation',
      translations: { zh: '安装' },
      items: [
        {
          label: 'Proxmox',
          translations: { zh: 'PVE' },
          slug: 'installation/proxmox',
        },
      ],
    },
    {
      label: 'Software',
      translations: { zh: '软件' },
      items: [
        {
          label: 'AdGuard Home',
          translations: { zh: 'AdGuard Home' },
          slug: 'software/adguard-home',
        },
      ],
    },
  ],
} as SiteMeta;

export default meta;
