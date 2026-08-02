/** Convert Persian/Arabic numerals to English */
export function toEnglishDigits(s: string | number): string {
  return String(s).replace(/[۰-۹٠-٩]/g, (c) =>
    String('٠١٢٣٤٥٦٧٨٩'.indexOf(c) >= 0 ? '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(c)] : '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(c)]));
}

/** Simpler version: just map Persian digits ۰-۹ to 0-9 */
export function parsePersianNumber(s: string | number): number {
  const cleaned = String(s)
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  return Number(cleaned) || 0;
}

export function formatNumber(n: number, decimals?: number): string {
  if (decimals !== undefined) {
    return n.toLocaleString('fa-IR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  return n.toLocaleString('fa-IR');
}
