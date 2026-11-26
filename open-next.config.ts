import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// Default cache. CVs stay in Postgres unless RESUME_STORE=r2 is set later.
export default defineCloudflareConfig();
