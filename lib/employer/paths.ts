/** Paths a signed-out visitor may open. The verify link is the sign-in itself. */
export function isPublicEmployerPath(pathname: string): boolean {
  return (
    pathname === '/employer/login' ||
    pathname === '/employer/register' ||
    pathname === '/employer/verify' ||
    pathname.startsWith('/employer/verify/')
  );
}
