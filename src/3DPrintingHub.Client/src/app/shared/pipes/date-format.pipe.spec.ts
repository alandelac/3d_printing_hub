import { DateFormatPipe } from './date-format.pipe';
import { formatIsoDate } from '../utils/date-format';

describe('date-format utilities', () => {
  it('formats valid ISO timestamps to YYYY-MM-DD', () => {
    expect(formatIsoDate('2026-08-25T03:58:56.028895')).toBe('2026-08-25');
    expect(formatIsoDate('2026-08-25')).toBe('2026-08-25');
  });

  it('returns empty output for null, empty and invalid values', () => {
    expect(formatIsoDate(null)).toBe('');
    expect(formatIsoDate('')).toBe('');
    expect(formatIsoDate('not-a-date')).toBe('');
    expect(formatIsoDate('2026-02-30')).toBe('');
  });
});

describe('DateFormatPipe', () => {
  it('transforms a timestamp through the shared pipe', () => {
    const pipe = new DateFormatPipe();

    expect(pipe.transform('2026-08-25T03:58:56.028895')).toBe('2026-08-25');
    expect(pipe.transform(null)).toBe('');
  });
});
