/**
 * Utility functions for i18n implementation
 */

/**
 * Format currency based on locale
 * @param {number} amount - Amount to format
 * @param {string} locale - Current locale (en/ar)
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, locale = "en", currency = "USD") {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Format date based on locale
 * @param {Date|string} date - Date to format
 * @param {string} locale - Current locale (en/ar)
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, locale = "en", options = {}) {
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    ...defaultOptions,
    ...options,
  }).format(new Date(date));
}

/**
 * Format number based on locale
 * @param {number} number - Number to format
 * @param {string} locale - Current locale (en/ar)
 * @returns {string} Formatted number string
 */
export function formatNumber(number, locale = "en") {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(
    number
  );
}

/**
 * Get text direction based on locale
 * @param {string} locale - Current locale
 * @returns {string} 'rtl' or 'ltr'
 */
export function getDirection(locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

/**
 * Check if current locale is RTL
 * @param {string} locale - Current locale
 * @returns {boolean} True if RTL
 */
export function isRTL(locale) {
  return locale === "ar";
}

/**
 * Get locale-specific class names
 * @param {string} locale - Current locale
 * @param {string} baseClass - Base CSS class
 * @returns {string} Class names with locale suffix
 */
export function getLocaleClass(locale, baseClass) {
  return `${baseClass} ${baseClass}-${locale}`;
}
