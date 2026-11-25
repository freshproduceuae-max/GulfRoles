export function appBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    'https://jobbrowser.app';
  return raw.replace(/\/$/, '');
}

export function contactEmail(): string {
  return (
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    process.env.CONTACT_EMAIL ||
    'contact@jobbrowser.app'
  );
}
