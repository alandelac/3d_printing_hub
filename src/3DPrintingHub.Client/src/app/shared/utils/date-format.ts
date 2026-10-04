export function formatIsoDate(value: string | null | undefined): string {
  if (!value || typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const dateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/i);
  if (!dateMatch) {
    return '';
  }

  const [, yearString, monthString, dayString] = dateMatch;
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return '';
  }

  const utcDate = new Date(Date.UTC(year, month - 1, day));
  const isValidDate = utcDate.getUTCFullYear() === year
    && utcDate.getUTCMonth() === month - 1
    && utcDate.getUTCDate() === day;

  if (!isValidDate) {
    return '';
  }

  return `${yearString}-${monthString}-${dayString}`;
}
