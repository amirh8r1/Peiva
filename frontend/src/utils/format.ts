/** Convert Persian/Arabic numerals to English */
export function toEnglishDigits(s: string | number): string {
  return String(s).replace(/[۰-۹٠-٩]/g, (c) => {
    const persianIdx = '۰۱۲۳۴۵۶۷۸۹'.indexOf(c);
    if (persianIdx >= 0) return String(persianIdx);
    const arabicIdx = '٠١٢٣٤٥٦٧٨٩'.indexOf(c);
    if (arabicIdx >= 0) return String(arabicIdx);
    return c;
  });
}

/** Convert English digits to Persian */
export function toPersianDigits(s: string | number): string {
  return String(s).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}

/** Parse a string with mixed Persian/English digits and thousands separators to a number */
export function parsePersianNumber(s: string | number): number {
  const cleaned = String(s)
    // Strip thousands separators (Persian ٬, English comma, Arabic comma)
    .replace(/[٬,٬]/g, '')
    // Convert Persian digits to English
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  return Number(cleaned) || 0;
}

/**
 * Format a number with Persian digits and optional thousands separator.
 * Does NOT rely on toLocaleString('fa-IR') — manually inserts ٬ separators
 * and converts all digits to Persian for consistent behaviour across browsers.
 */
export function formatNumber(n: number, decimals?: number): string {
  // 1. Format with en-US to get proper grouping (commas) + fixed decimals
  const opts: Intl.NumberFormatOptions = decimals !== undefined
    ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
    : { maximumFractionDigits: 2 };
  const enFormatted = n.toLocaleString('en-US', opts);

  // 2. Replace English commas → Persian thousands separator, dots → Persian decimal separator
  //    Also replace any remaining English digits with Persian digits
  let result = '';
  for (const ch of enFormatted) {
    if (ch === ',') result += '٬';
    else if (ch === '.') result += '٫';
    else if (ch >= '0' && ch <= '9') result += '۰۱۲۳۴۵۶۷۸۹'[Number(ch)];
    else result += ch;
  }
  return result;
}
