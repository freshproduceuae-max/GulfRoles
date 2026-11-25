import { test, expect } from '@playwright/test';

const PRIVATE_PAGES = [
  '/employer/company',
  '/employer/templates',
  '/employer/sources',
  '/employer/jobs',
  '/employer/post-job',
  '/employer/inbox/00000000-0000-0000-0000-000000000001',
  '/employer/jobs/00000000-0000-0000-0000-000000000001/edit',
  '/employer/applicants/00000000-0000-0000-0000-000000000001',
  '/employer/candidates',
  '/employer/analytics',
  '/employer/team',
];

const PRIVATE_APIS = [
  ['GET', '/api/employer/company'],
  ['PATCH', '/api/employer/company'],
  ['GET', '/api/employer/jobs'],
  ['GET', '/api/employer/jobs/00000000-0000-0000-0000-000000000001'],
  ['PATCH', '/api/employer/jobs/00000000-0000-0000-0000-000000000001'],
  ['GET', '/api/employer/templates'],
  ['POST', '/api/employer/templates'],
  ['GET', '/api/employer/sources'],
  ['POST', '/api/employer/sources'],
  ['GET', '/api/employer/pipeline?job_id=00000000-0000-0000-0000-000000000001'],
  ['POST', '/api/employer/pipeline'],
  ['GET', '/api/employer/applicants/00000000-0000-0000-0000-000000000001'],
  ['PATCH', '/api/employer/applicants/00000000-0000-0000-0000-000000000001'],
  ['GET', '/api/employer/candidates'],
  ['POST', '/api/employer/candidates/invite'],
  ['GET', '/api/employer/saved-searches'],
  ['POST', '/api/employer/saved-searches'],
  ['POST', '/api/employer/interviews'],
  ['GET', '/api/employer/analytics'],
  ['GET', '/api/employer/team'],
  ['POST', '/api/employer/team'],
];

test('signed-out employer pages redirect and employer APIs return 401', async ({ page, request }) => {
  const login = await request.get('/employer/login');
  expect(login.status()).toBe(200);

  for (const path of PRIVATE_PAGES) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBeGreaterThanOrEqual(300);
    expect(response.status(), path).toBeLessThan(400);
    expect(response.headers().location || '', path).toContain('/employer/login');
    await page.goto(path);
    await expect(page, path).toHaveURL(/\/employer\/login/);
    await expect(page.getByLabel('Template name')).toHaveCount(0);
    await expect(page.getByLabel('Profile company name')).toHaveCount(0);
  }

  await page.context().addCookies([
    { name: 'employer_session', value: 'forged-session', url: 'http://127.0.0.1:3000' },
    { name: 'employer_id', value: '00000000-0000-0000-0000-000000000099', url: 'http://127.0.0.1:3000' },
  ]);
  await page.goto('/employer/company');
  await expect(page).toHaveURL(/\/employer\/login/);
  await page.context().clearCookies();

  for (const [method, path] of PRIVATE_APIS) {
    const response = await request.fetch(path, { method, maxRedirects: 0 });
    expect(response.status(), `${method} ${path}`).toBe(401);
  }
});

test('an employer cannot read or change another company job', async ({ page, browser }) => {
  test.setTimeout(90_000);
  const stamp = Date.now().toString();

  await page.goto('/employer/login');
  await page.getByLabel('Company Name').fill(`Owner A ${stamp}`);
  await page.getByLabel('Company Email').fill(`a-${stamp}@owners.example`);
  await page.getByRole('button', { name: 'Send Verification Link' }).click();
  await page.getByRole('link', { name: 'Open verification link' }).click();
  await page.waitForFunction(() => {
    const field = document.querySelector('#job-title');
    return !!field && Object.keys(field).some((key) => key.startsWith('__reactProps'));
  });
  await page.getByLabel('Job Title').fill(`Private role ${stamp}`);
  await page.getByLabel('Company Name').fill(`Owner A ${stamp}`);
  await page.getByLabel('Location').fill('Dubai');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('Job Description').fill('Registered nurse for a Dubai clinic. Two years of ward experience and day shifts.');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Publish Job' }).click();
  await expect(page.getByText('Your job is published')).toBeVisible();
  const jobId = (await page.locator('code').innerText()).trim();

  const other = await browser.newContext();
  const otherPage = await other.newPage();
  await otherPage.goto('/employer/login');
  await otherPage.getByLabel('Company Name').fill(`Owner B ${stamp}`);
  await otherPage.getByLabel('Company Email').fill(`b-${stamp}@owners.example`);
  await otherPage.getByRole('button', { name: 'Send Verification Link' }).click();
  await otherPage.getByRole('link', { name: 'Open verification link' }).click();
  await expect(otherPage).toHaveURL(/\/employer\/post-job/);

  const read = await otherPage.request.get(`/api/employer/jobs/${jobId}`);
  expect(read.status()).toBe(404);
  const change = await otherPage.request.patch(`/api/employer/jobs/${jobId}`, {
    data: { action: 'pause' },
  });
  expect(change.status()).toBe(404);
  const pipeline = await otherPage.request.get(`/api/employer/pipeline?job_id=${jobId}`);
  expect(pipeline.status()).toBe(404);

  const ownList = await page.request.get('/api/employer/jobs');
  expect(ownList.status()).toBe(200);
  const ownBody = await ownList.json();
  expect(JSON.stringify(ownBody)).toContain(jobId);
  await other.close();
});
