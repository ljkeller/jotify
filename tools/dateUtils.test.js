const { formatISO } = require('date-fns');

const { ambiguousDateToIso8601Date } = require('./dateUtils');

test('bad date resolves to today', () => {
  expect(ambiguousDateToIso8601Date('bad date')).toBe(formatISO(new Date(), { representation: "date" }));
});

test('dob date resolves to iso 8601', () => {
  expect(ambiguousDateToIso8601Date('11/2/1991')).toBe('1991-11-02');
});

test('charge date resolves to iso 8601', () => {
  expect(ambiguousDateToIso8601Date('2024-01-18')).toBe('2024-01-18');
});