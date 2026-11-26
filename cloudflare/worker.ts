// Custom Worker entry. OpenNext generates the fetch handler at build time.
// @ts-ignore `.open-next/worker.js` exists only after `opennextjs-cloudflare build`.
import { default as handler } from '../.open-next/worker.js';
import { cronRequestPath } from '../lib/cron/routes';

interface CronEnv {
  CRON_SECRET?: string;
}

export default {
  fetch: handler.fetch,

  async scheduled(event: { cron: string }, env: CronEnv, ctx: { waitUntil: (promise: Promise<unknown>) => void }) {
    const path = cronRequestPath(event.cron);
    if (!path || !env.CRON_SECRET) return;
    const request = new Request(`https://jobbrowser.app${path}`, {
      headers: { authorization: `Bearer ${env.CRON_SECRET}` },
    });
    ctx.waitUntil(handler.fetch(request, env, ctx));
  },
};

// Required if the build enables the OpenNext queue or tag cache.
// @ts-ignore generated with the worker
export { DOQueueHandler, DOShardedTagCache } from '../.open-next/worker.js';
