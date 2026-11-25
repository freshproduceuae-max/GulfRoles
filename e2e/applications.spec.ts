import fs from 'fs';
import { test, expect } from '@playwright/test';

const cv = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');

test('crawlers are turned away until SITE_PUBLIC=true', async ({ page, request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  const body = await robots.text();
  expect(body).toMatch(/Disallow:\s*\/\s*$/m);
  expect(body).toContain('Sitemap: http://127.0.0.1:3000/sitemap.xml');
  expect(body).not.toContain('jobbrowser.app');
  expect(robots.headers()['x-robots-tag']).toMatch(/noindex/i);

  const home = await request.get('/');
  expect(home.headers()['x-robots-tag']).toMatch(/noindex/i);
  await page.goto('/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i);
});

test('employer posts, candidate applies with a CV, employer downloads it', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const stamp = Date.now().toString();
  const title = `Clinic nurse ${stamp}`;
  const shot = async (name: string) => {
    if (testInfo.project.name !== 'desktop' && testInfo.project.name !== 'mobile') return;
    await page.screenshot({
      path: `/opt/cursor/artifacts/${name}-${testInfo.project.name}.png`,
      fullPage: true,
    });
  };

  await page.goto('/employer/login');
  await page.getByLabel('Company Name').fill(`Clinic ${stamp}`);
  await page.getByLabel('Company Email').fill(`hr-${stamp}@clinic.example`);
  await page.getByRole('button', { name: 'Send Verification Link' }).click();
  await page.getByRole('link', { name: 'Open verification link' }).click();
  await expect(page).toHaveURL(/\/employer\/post-job/);
  await page.waitForFunction(() => {
    const title = document.querySelector('#job-title');
    return !!title && Object.keys(title).some((key) => key.startsWith('__reactProps'));
  });

  await page.getByLabel('Job Title').fill(title);
  await page.getByLabel('Company Name').fill(`Clinic ${stamp}`);
  await page.getByLabel('Location').fill('Dubai');
  await page.getByLabel('Region').selectOption('UAE');
  await page.getByLabel('Job Type').selectOption('full-time');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('Job Description').fill('Registered nurse for a Dubai clinic. Two years of ward experience and day shifts.');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Publish Job' }).click();
  await expect(page.getByText('Your job is published')).toBeVisible();
  await shot('job-posted');

  await page.getByRole('link', { name: 'View public job' }).click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  await page.waitForFunction(() => {
    const apply = Array.from(document.querySelectorAll('button')).find((button) => button.textContent?.includes('Apply now'));
    return !!apply && Object.keys(apply).some((key) => key.startsWith('__reactProps'));
  });
  await page.getByRole('button', { name: 'Apply now' }).click();
  await page.getByLabel('Full Name').fill('Jane Candidate');
  await page.getByLabel('Email Address').fill(`jane-${stamp}@candidate.example`);
  await page.getByLabel('Phone Number').fill('+971500000000');
  await page.getByLabel('Cover note').fill('I can start next month.');
  await page.locator('#resume-input').setInputFiles({
    name: 'jane-cv.pdf',
    mimeType: 'application/pdf',
    buffer: cv,
  });
  await shot('apply-form');
  await page.getByRole('button', { name: 'Submit Application' }).click();
  const status = page.getByRole('link', { name: 'Check application status' });
  await expect(status).toBeVisible();
  await status.click();
  await expect(page.getByText('New', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Application status' })).toBeVisible();
  await shot('application-status');

  await page.goto('/employer/jobs');
  await expect(page.getByRole('listitem').filter({ hasText: title })).toContainText('1 applicant');
  await shot('employer-jobs');
  await page.getByRole('link', { name: new RegExp(title) }).click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  await page.waitForFunction(() => {
    const person = Array.from(document.querySelectorAll('button')).find((button) => button.textContent?.includes('Jane Candidate'));
    return !!person && Object.keys(person).some((key) => key.startsWith('__reactProps'));
  });
  await page.getByRole('button', { name: /Jane Candidate/ }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download CV' }).click();
  const download = await downloadPromise;
  const filePath = await download.path();
  expect(filePath).toBeTruthy();
  const saved = fs.readFileSync(filePath as string);
  expect(saved.subarray(0, 5).toString()).toBe('%PDF-');
  await page.getByRole('button', { name: 'Shortlisted' }).click();
  await expect(page.locator('[data-status="shortlisted"]')).toBeVisible();
  await shot('applicant-inbox');
});
