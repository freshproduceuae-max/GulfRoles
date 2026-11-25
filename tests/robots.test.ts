import assert from 'node:assert/strict';
import test from 'node:test';
import { isSitePublic, robotsPolicy } from '../lib/site';

test('the site stays closed to crawlers until SITE_PUBLIC=true', () => {
  const previous = process.env.SITE_PUBLIC;
  delete process.env.SITE_PUBLIC;
  assert.equal(isSitePublic(), false);
  process.env.SITE_PUBLIC = 'false';
  assert.equal(isSitePublic(), false);
  process.env.SITE_PUBLIC = 'true';
  assert.equal(isSitePublic(), true);
  if (previous === undefined) delete process.env.SITE_PUBLIC;
  else process.env.SITE_PUBLIC = previous;
});

test('robots.txt blocks every path until launch and uses the configured origin', () => {
  const closed = robotsPolicy('https://jobbrowser.vercel.app', false);
  assert.deepEqual(closed.disallow, ['/']);
  assert.equal(closed.sitemap, 'https://jobbrowser.vercel.app/sitemap.xml');
  assert.equal(closed.sitemap.includes('jobbrowser.app'), false);

  const open = robotsPolicy('https://jobbrowser.app/', true);
  assert.equal(open.allow, '/');
  assert.equal(open.disallow.includes('/'), false);
  assert.equal(open.sitemap, 'https://jobbrowser.app/sitemap.xml');
});
