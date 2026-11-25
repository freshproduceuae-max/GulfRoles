import { test, expect } from '@playwright/test';

test('employer edits the company, adds a screening question, and pauses the job', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const stamp = Date.now().toString();
  const title = `Recruiter nurse ${stamp}`;
  const shot = async (name: string) => {
    await page.screenshot({
      path: `/opt/cursor/artifacts/${name}-${testInfo.project.name}.png`,
      fullPage: true,
    });
  };

  await page.goto('/employer/login');
  await page.getByLabel('Company Name').fill(`Recruiter Clinic ${stamp}`);
  await page.getByLabel('Company Email').fill(`hr-${stamp}@recruiter.example`);
  await page.getByRole('button', { name: 'Send Verification Link' }).click();
  await page.getByRole('link', { name: 'Open verification link' }).click();
  await page.waitForFunction(() => {
    const field = document.querySelector('#job-title');
    return !!field && Object.keys(field).some((key) => key.startsWith('__reactProps'));
  });
  await page.getByLabel('Job Title').fill(title);
  await page.getByLabel('Company Name').fill(`Recruiter Clinic ${stamp}`);
  await page.getByLabel('Location').fill('Dubai');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('Job Description').fill('Registered nurse for a Dubai clinic. Two years of ward experience and day shifts.');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Publish Job' }).click();
  await expect(page.getByText('Your job is published')).toBeVisible();

  await page.goto('/employer/company');
  await page.waitForFunction(() => {
    const input = document.querySelector('[aria-label="Profile company name"]') as HTMLInputElement | null;
    return !!input && input.value.length > 0 && Object.keys(input).some((key) => key.startsWith('__reactProps'));
  });
  await page.getByLabel('Industry').fill('Healthcare');
  await page.getByLabel('Company description').fill('A small clinic in Dubai.');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByText('Company profile saved.')).toBeVisible();
  await shot('company-profile');

  await page.goto('/employer/jobs');
  await page.getByRole('listitem').filter({ hasText: title }).getByRole('link', { name: 'Edit' }).click();
  await expect(page.getByLabel('Edit job title')).toHaveValue(title);
  await page.getByRole('button', { name: 'Add question' }).click();
  await page.getByLabel('Question 1', { exact: true }).fill('Are you licensed?');
  await page.getByRole('button', { name: 'Save job' }).click();
  await expect(page.getByText('Job saved.')).toBeVisible();
  await shot('screening-question');

  await page.goto('/employer/jobs');
  await page.getByRole('listitem').filter({ hasText: title }).getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: title })).toContainText('paused');
  await page.getByRole('listitem').filter({ hasText: title }).getByRole('button', { name: 'Duplicate' }).click();
  await expect(page.getByText(`${title} (copy)`)).toBeVisible();
  await shot('job-management');
});
