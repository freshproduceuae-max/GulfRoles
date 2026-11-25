/**
 * Preview deployments share the production Neon database.
 * Applying migrations there would change live tables.
 * Production builds and an explicit RUN_MIGRATIONS=true still apply them.
 * `npm run migrate` sets that flag. A local `npm run build` does not.
 */
export function shouldRunMigrations(
  env: { RUN_MIGRATIONS?: string; VERCEL_ENV?: string } = {
    RUN_MIGRATIONS: process.env.RUN_MIGRATIONS,
    VERCEL_ENV: process.env.VERCEL_ENV,
  }
): boolean {
  if (env.RUN_MIGRATIONS === 'true') return true;
  if (env.VERCEL_ENV === 'production') return true;
  return false;
}
