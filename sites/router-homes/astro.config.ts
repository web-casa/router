import { fileURLToPath } from 'node:url';
import { createDocsConfig } from '@fleet/docs-kit';
import meta from './site.meta';

export default createDocsConfig(meta, {
  alias: {
    '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
  },
});
