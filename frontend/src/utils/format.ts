/**
 * Format a number with Persian numerals.
 * Uses fa-IR locale for consistent Persian digit output.
 *
 * @example formatNumber(12000)        // "۱۲٬۰۰۰"
 * @example formatNumber(1.75, 1)      // "۱٫۸"
 * @example formatNumber(1.6, 1)       // "۱٫۶"
 */
export function formatNumber(n: number, decimals?: number): string {
  if (decimals !== undefined) {
    return n.toLocaleString('fa-IR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return n.toLocaleString('fa-IR');
}
