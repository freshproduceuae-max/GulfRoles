import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const INTERNAL = [
  '/',
  '/search',
  '/saved',
  '/about',
  '/privacy',
  '/terms',
  '/contact',
  '/help',
  '/faq',
  '/cookies',
  '/salary-guide',
  '/careers',
  '/blog',
  '/ae',
  '/sa',
  '/in',
  '/au',
  '/us',
  '/employer/login',
  '/employer/sources',
  '/admin/login',
];

test('internal routes answer and linked pages are not 404', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const path of INTERNAL) {
    const response = await request.get(path);
    expect(response.status(), path).toBeLessThan(400);
  }
  await page.goto('/');
  const hrefs = await page.locator('a[href^="/"]').evaluateAll((links) =>
    links.map((link) => (link as HTMLAnchorElement).getAttribute('href') || '')
  );
  const unique = Array.from(new Set(hrefs.map((href) => href.split('?')[0].split('#')[0]).filter(Boolean)));
  for (const href of unique) {
    const response = await request.get(href);
    expect(response.status(), href).toBeLessThan(400);
  }
  expect(errors).toEqual([]);
});

test('search, job view, save, and apply redirect', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('main').getByLabel('Job title or keyword').fill('Ward nurse');
  await page.getByRole('main').getByLabel('Location').fill('Dubai');
  await page.getByRole('main').getByLabel('Country').selectOption('UAE');
  await page.getByRole('main').getByRole('button', { name: 'Search' }).click();
  await expect(page).toHaveURL(/\/search\?/);
  await expect(page.getByRole('heading', { name: 'Ward nurse' })).toBeVisible();
  await page.getByRole('link', { name: /Ward nurse/ }).first().click();
  await expect(page).toHaveURL(/\/jobs\//);
  await expect(page.getByRole('heading', { name: 'Ward nurse' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Apply on Careerjet' })).toBeVisible();
  await page.getByRole('button', { name: 'Save job' }).click();
  await page.goto('/saved');
  await expect(page.getByRole('heading', { name: 'Ward nurse' })).toBeVisible();
  await page.goto('/search?q=Ward%20nurse');
  await page.getByRole('link', { name: /Ward nurse/ }).first().click();
  const popup = page.waitForURL(/example\.com|careerjet|\/api\/affiliate/);
  await page.getByRole('link', { name: /Apply on/ }).click();
  await popup;
});

test('weekly alert signup', async ({ page }) => {
  await page.goto('/#job-alerts');
  await page.locator('#job-alerts').getByLabel('Email for weekly job alerts').fill('seeker@example.com');
  await page.locator('#job-alerts').getByRole('button', { name: 'Subscribe' }).click();
  await expect(page.getByText(/subscribed|already subscribed|unavailable|not configured/i)).toBeVisible();
});

test('employer post starts with a verification link', async ({ page }) => {
  const stamp = Date.now().toString();
  await page.goto('/employer/login');
  await page.getByLabel('Company Name').fill(`QA Clinic ${stamp}`);
  await page.getByLabel('Company Email').fill(`hr-${stamp}@qaclinic.example`);
  await page.getByRole('button', { name: 'Send Verification Link' }).click();
  const link = page.getByRole('link', { name: 'Open verification link' });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/employer\/post-job/);
  await expect(page.getByRole('heading', { name: /Post a Job/i })).toBeVisible();
});

test('admin can sign in', async ({ page }) => {
  await page.goto('/admin/login');
  await page.locator('input[name="email"]').fill('admin@jobbrowser.app');
  await page.locator('input[name="password"]').fill('test-admin-pass');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(/\/admin/);
});

test('home and search have no serious accessibility violations', async ({ page }) => {
  for (const path of ['/', '/search?q=nurse', '/about']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations, `${path} ${JSON.stringify(results.violations)}`).toEqual([]);
  }
});
