import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      ...process.env,
      ADMIN_EMAIL: 'admin@jobbrowser.app',
      ADMIN_PASSWORD: 'test-admin-pass',
      NEXTAUTH_SECRET: 'test-secret-test-secret-test-secret-32',
      NEXTAUTH_URL: 'http://127.0.0.1:3000',
      NEXT_PUBLIC_APP_BASE_URL: 'http://127.0.0.1:3000',
    },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'mobile', use: { ...devices['Pixel 5'], channel: 'chrome' } },
  ],
});
