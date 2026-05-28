/**
 * Data formatting utilities.
 */

/** Format a number with locale-specific thousands separators */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

/** Format file size in human-readable form */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}\u2026`;
}
