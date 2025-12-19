/**
 * Test severity levels - compatible with Allure.
 */

export enum Severity {
  BLOCKER = 'blocker',
  CRITICAL = 'critical',
  NORMAL = 'normal',
  MINOR = 'minor',
  TRIVIAL = 'trivial',
}

/**
 * Convert string to Severity enum.
 */
export function parseSeverity(value: string): Severity {
  const normalized = value.toLowerCase();
  switch (normalized) {
    case 'blocker':
      return Severity.BLOCKER;
    case 'critical':
      return Severity.CRITICAL;
    case 'minor':
      return Severity.MINOR;
    case 'trivial':
      return Severity.TRIVIAL;
    default:
      return Severity.NORMAL;
  }
}
