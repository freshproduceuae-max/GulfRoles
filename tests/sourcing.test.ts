import assert from 'node:assert/strict';
import test from 'node:test';
import { redactContact, toPublicCandidate } from '../lib/candidates/privacy';
import { buildInterviewIcs } from '../lib/calendar/ics';

test('employer-facing text hides email and phone', () => {
  const text = redactContact('Email jane@example.com or call +971 50 000 0000 about the ward.');
  assert.equal(text.includes('jane@example.com'), false);
  assert.equal(text.includes('0000'), false);
  assert.match(text, /email hidden/);
  assert.match(text, /phone hidden/);
});

test('a searchable card hides contact until an invite is accepted', () => {
  const row = {
    id: 'p1',
    full_name: 'Jane Candidate',
    email: 'jane@example.com',
    phone: '+971500000000',
    headline: 'Ward nurse',
    location: 'Dubai',
    experience_years: 4,
    skills: 'nursing',
    resume_text: 'Reach me at jane@example.com',
  };
  const hidden = toPublicCandidate(row, false);
  assert.equal(hidden.email, undefined);
  assert.equal(hidden.full_name, undefined);
  assert.match(hidden.excerpt, /email hidden/);
  const shown = toPublicCandidate(row, true);
  assert.equal(shown.email, 'jane@example.com');
});

test('an interview ICS file has the booked times', () => {
  const ics = buildInterviewIcs({
    uid: 'slot-1@jobbrowser.app',
    title: 'Interview: Nurse',
    description: 'Booked on JobBrowser',
    startsAt: new Date('2026-12-01T09:00:00Z'),
    endsAt: new Date('2026-12-01T09:30:00Z'),
  });
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /DTSTART:20261201T090000Z/);
  assert.match(ics, /DTEND:20261201T093000Z/);
});
