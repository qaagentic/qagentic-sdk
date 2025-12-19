/**
 * Test execution status.
 */

export enum Status {
  PASSED = 'passed',
  FAILED = 'failed',
  BROKEN = 'broken',
  SKIPPED = 'skipped',
  PENDING = 'pending',
  RUNNING = 'running',
  UNKNOWN = 'unknown',
}

/**
 * Check if status represents a successful outcome.
 */
export function isSuccessful(status: Status): boolean {
  return status === Status.PASSED;
}

/**
 * Check if status represents a failure.
 */
export function isFailure(status: Status): boolean {
  return status === Status.FAILED || status === Status.BROKEN;
}

/**
 * Parse status from string.
 */
export function parseStatus(value: string): Status {
  const normalized = value.toLowerCase();
  switch (normalized) {
    case 'passed':
    case 'pass':
    case 'success':
      return Status.PASSED;
    case 'failed':
    case 'fail':
    case 'failure':
      return Status.FAILED;
    case 'broken':
    case 'error':
      return Status.BROKEN;
    case 'skipped':
    case 'skip':
    case 'pending':
      return Status.SKIPPED;
    case 'running':
      return Status.RUNNING;
    default:
      return Status.UNKNOWN;
  }
}
