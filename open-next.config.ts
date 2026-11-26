import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// Default cache. CV files use the RESUMES R2 binding, not this cache.
export default defineCloudflareConfig();
