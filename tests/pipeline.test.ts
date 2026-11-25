import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateScreening } from '../lib/employer/screening';
import { extractPdf, extractResumeText } from '../lib/resume-text';

test('a must-have yes/no question flags a no answer', () => {
  const result = evaluateScreening(
    [{
      id: 'q1',
      prompt: 'Licensed?',
      answerType: 'yes_no',
      required: true,
      knockout: true,
      expectedYes: true,
      minNumber: null,
    }],
    { q1: 'no' }
  );
  assert.equal(result.knockout, true);
  assert.equal(result.results[0].knockedOut, true);
});

test('a number above the minimum is not flagged', () => {
  const result = evaluateScreening(
    [{
      id: 'q1',
      prompt: 'Years',
      answerType: 'number',
      required: true,
      knockout: true,
      expectedYes: null,
      minNumber: 2,
    }],
    { q1: '3' }
  );
  assert.equal(result.knockout, false);
});

test('PDF text operators are readable for search', () => {
  const pdf = Buffer.from('%PDF-1.4\n(Ward nurse) Tj\n%%EOF');
  assert.match(extractPdf(pdf), /Ward nurse/);
  assert.match(extractResumeText(pdf, '.pdf'), /Ward nurse/);
});
