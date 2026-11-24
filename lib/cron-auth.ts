/**
 * Vercel Cron sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set.
 * Requests without that secret are rejected. There is no anonymous fallback.
 */
export function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get('authorization') || '';
  return header === `Bearer ${secret}`;
}
