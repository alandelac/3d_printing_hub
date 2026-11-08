export function calculateMarginPercent(cost: number, salePrice: number): number | null {
  if (!Number.isFinite(cost) || cost <= 0 || !Number.isFinite(salePrice) || salePrice <= 0) {
    return null;
  }

  return ((salePrice - cost) / salePrice) * 100;
}

export function getMarginClass(margin: number | null): string | null {
  if (margin === null) {
    return null;
  }
  if (margin > 50) {
    return 'margin--green-strong';
  }
  if (margin > 35) {
    return 'margin--green';
  }
  if (margin > 25) {
    return 'margin--yellow';
  }
  return 'margin--red';
}
