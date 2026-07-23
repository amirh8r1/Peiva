/**
 * RTL configuration.
 * Ant Design handles RTL via ConfigProvider direction="rtl".
 * This file provides additional RTL-related utilities if needed later.
 */

/**
 * Updates document direction and language attributes.
 * Called once at app initialization.
 */
export function initRTL(): void {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'fa';
}

// Auto-initialize
initRTL();
