import { test, expect } from '@playwright/test';

async function employerReady(page: import('@playwright/test').Page, company: string, email: string) {
  await page.goto('/employer/login');
  await page.getByLabel('Company Name').fill(company);
  await page.getByLabel('Company Email').fill(email);
  await page.getByRole('button', { name: 'Send Verification Link' }).click();
  await page.getByRole('link', { name: 'Open verification link' }).click();
  await page.waitForFunction(() => {
    const field = document.querySelector('#job-title');
    return !!field && Object.keys(field).some((key) => key.startsWith('__reactProps'));
  });
}

async function publishJob(page: import('@playwright/test').Page, title: string) {
  await page.getByLabel('Job Title').fill(title);
  await page.getByLabel('Company Name').fill(title);
  await page.getByLabel('Location').fill('Dubai');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('Job Description').fill('Registered nurse for a Dubai clinic. Two years of ward experience and day shifts.');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Publish Job' }).click();
  await expect(page.getByText('Your job is published')).toBeVisible();
  return (await page.locator('code').innerText()).trim();
}

test('a candidate can opt in, hide contact details, and withdraw', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const stamp = Date.now().toString();
  const skill = `wardskill${stamp}`;
  const email = `jane-${stamp}@candidate.example`;

  await page.goto('/profile');
  await page.getByLabel('Full name').fill('Jane Candidate');
  await page.getByLabel('Profile email').fill(email);
  await page.getByLabel('Profile phone').fill('+971500009991');
  await page.getByLabel('Headline').fill(`Nurse ${stamp}`);
  await page.getByLabel('Profile location').fill('Dubai');
  await page.getByLabel('Profile experience').fill('4');
  await page.getByLabel('Profile skills').fill(skill);
  await page.getByLabel('Search consent').check();
  await page.getByRole('button', { name: 'Save profile' }).click();
  await page.getByRole('link', { name: 'Open confirmation link' }).click();
  await expect(page.getByText('Search is on.')).toBeVisible();
  await page.screenshot({ path: `/opt/cursor/artifacts/candidate-profile-${testInfo.project.name}.png`, fullPage: true });

  await employerReady(page, `Search Clinic ${stamp}`, `hr-${stamp}@search.example`);
  const jobId = await publishJob(page, `Search nurse ${stamp}`);
  await page.goto('/employer/candidates');
  await page.getByLabel('Search skills').fill(skill);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByText(`Nurse ${stamp}`)).toBeVisible();
  await expect(page.getByText(email)).toHaveCount(0);
  await expect(page.getByText('Contact details hidden')).toBeVisible();
  await page.screenshot({ path: `/opt/cursor/artifacts/candidate-search-${testInfo.project.name}.png`, fullPage: true });
  await page.getByLabel('Invite job id').fill(jobId);
  await page.getByRole('button', { name: 'Invite to apply' }).click();
  const inviteText = await page.getByText(/\/invites\//).innerText();
  const inviteUrl = inviteText.match(/https?:\/\/\S+/)?.[0];
  expect(inviteUrl).toBeTruthy();
  await page.goto(inviteUrl as string);
  await page.getByRole('button', { name: 'Accept' }).click();
  await expect(page.getByText('You accepted')).toBeVisible();

  await page.goto('/employer/candidates');
  await page.getByLabel('Search skills').fill(skill);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByText(email)).toBeVisible();

  await page.goto('/profile');
  await page.getByRole('button', { name: 'Turn off search' }).click();
  await expect(page.getByText('Search is off.')).toBeVisible();
  await page.goto('/employer/candidates');
  await page.getByLabel('Search skills').fill(skill);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByText(`Nurse ${stamp}`)).toHaveCount(0);
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Delete my data' }).click();
  await expect(page.getByText('Your profile and CV were deleted.')).toBeVisible();
});

test('analytics, team invite, and interview booking', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const stamp = Date.now().toString();
  const title = `Analytics nurse ${stamp}`;
  await employerReady(page, `Team Clinic ${stamp}`, `owner-${stamp}@team.example`);
  await publishJob(page, title);
  await page.goto('/employer/analytics');
  await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible();
  await expect(page.getByRole('cell', { name: title })).toBeVisible();
  await page.screenshot({ path: `/opt/cursor/artifacts/analytics-${testInfo.project.name}.png`, fullPage: true });

  await page.goto('/employer/team');
  await page.getByLabel('Teammate email').fill(`viewer-${stamp}@team.example`);
  await page.getByLabel('Teammate role').selectOption('viewer');
  await page.getByRole('button', { name: 'Invite' }).click();
  const teamText = await page.getByText(/\/api\/employer\/team\/accept\//).innerText();
  const teamUrl = teamText.match(/https?:\/\/\S+/)?.[0];
  expect(teamUrl).toBeTruthy();
  await page.goto(teamUrl as string);
  await expect(page).toHaveURL(/\/employer\/jobs/);
  await page.screenshot({ path: `/opt/cursor/artifacts/team-${testInfo.project.name}.png`, fullPage: true });
});

test('a candidate books an interview slot and receives a calendar invite', async ({ page }) => {
  test.setTimeout(120_000);
  const stamp = Date.now().toString();
  const title = `Interview nurse ${stamp}`;
  const pdf = Buffer.from('%PDF-1.4\n(Ward nurse) Tj\n%%EOF');

  await employerReady(page, `Interview Clinic ${stamp}`, `hr-${stamp}@interview.example`);
  await publishJob(page, title);
  await page.getByRole('link', { name: 'View public job' }).click();
  await page.waitForFunction(() => {
    const apply = Array.from(document.querySelectorAll('button')).find((button) => button.textContent?.includes('Apply now'));
    return !!apply && Object.keys(apply).some((key) => key.startsWith('__reactProps'));
  });
  await page.getByRole('button', { name: 'Apply now' }).click();
  await page.getByLabel('Full Name').fill('Jane Candidate');
  await page.getByLabel('Email Address').fill(`jane-${stamp}@interview.example`);
  await page.locator('#resume-input').setInputFiles({ name: 'jane-cv.pdf', mimeType: 'application/pdf', buffer: pdf });
  await page.getByRole('button', { name: 'Submit Application' }).click();
  await expect(page.getByRole('link', { name: 'Check application status' })).toBeVisible();

  await page.goto('/employer/jobs');
  await page.getByRole('link', { name: new RegExp(title) }).click();
  await page.waitForFunction(() => {
    const person = Array.from(document.querySelectorAll('button')).find((button) => button.textContent?.includes('Jane Candidate'));
    return !!person && Object.keys(person).some((key) => key.startsWith('__reactProps'));
  });
  await page.getByRole('button', { name: /Jane Candidate/ }).click();
  await page.getByRole('link', { name: 'Open applicant' }).click();
  await page.getByLabel('Slot start').fill('2026-12-01T09:00');
  await page.getByLabel('Slot end').fill('2026-12-01T09:30');
  await page.waitForFunction(() => {
    const button = Array.from(document.querySelectorAll('button')).find((el) => el.textContent?.includes('Propose interview'));
    return !!button && Object.keys(button).some((key) => key.startsWith('__reactProps'));
  });
  await page.getByRole('button', { name: 'Propose interview' }).click();
  const link = page.getByText(/\/interviews\//);
  await expect(link).toBeVisible();
  const interviewUrl = (await link.innerText()).match(/https?:\/\/\S+/)?.[0];
  expect(interviewUrl).toBeTruthy();
  await page.goto(interviewUrl as string);
  await page.getByRole('button', { name: 'Pick this time' }).click();
  await expect(page.getByText('Time booked')).toBeVisible();
});
