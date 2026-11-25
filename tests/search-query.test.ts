import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSearchQuery, buildSortClause } from '../lib/search';

test('search matches the query text and hides expired rows', () => {
  const built = buildSearchQuery({ q: 'nurse', region: 'UAE' });
  assert.match(built.whereClause, /plainto_tsquery\('english', \$2\)/);
  assert.equal(built.params.includes('english'), false);
  assert.equal(built.params[1], 'nurse');
  assert.match(built.whereClause, /deleted_at IS NULL/);
  assert.match(built.whereClause, /expires_at/);
  assert.equal(built.queryParamIndex, 2);
  assert.match(buildSortClause(undefined, built.queryParamIndex), /plainto_tsquery\('english', \$2\)/);
});

test('featured filter is opt-in', () => {
  const plain = buildSearchQuery({});
  const featured = buildSearchQuery({ featured: true });
  assert.equal(plain.whereClause.includes('is_featured'), false);
  assert.match(featured.whereClause, /is_featured = TRUE/);
});
