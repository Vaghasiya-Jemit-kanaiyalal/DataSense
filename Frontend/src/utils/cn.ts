/**
 * Merge CSS class names, filtering out falsy values.
 * Lightweight alternative to clsx/classnames for CSS Module usage.
 *
 * @example
 * cn(styles.base, isActive && styles.active, className)
 */
export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(' ');
}
