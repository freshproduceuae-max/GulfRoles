/** Workers cron expressions and the routes they call. Kept in sync with vercel.json. */
export const CRON_ROUTES: Record<string, string> = {
  '0 5 * * *': '/api/cron/daily',
  '0 16 * * *': '/api/cron/send-alerts',
};

export function cronRequestPath(cron: string): string | undefined {
  return CRON_ROUTES[cron];
}
