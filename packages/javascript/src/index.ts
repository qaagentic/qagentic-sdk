/**
 * QAagentic SDK - AI-Powered Test Intelligence Platform
 *
 * A next-generation test reporting library that brings AI-powered insights
 * to your test automation. Works with Cypress, Playwright, Jest, and more.
 *
 * @example
 * ```typescript
 * import { feature, story, step, severity, Severity } from '@qagentic/reporter';
 *
 * describe('User Authentication', { feature: 'Authentication' }, () => {
 *   it('should login successfully', { severity: 'critical' }, () => {
 *     step('Enter credentials', () => {
 *       // test code
 *     });
 *   });
 * });
 * ```
 */

// Core exports
export { configure, getConfig, type QAgenticConfig } from './core/config';
export { Severity } from './core/severity';
export { Status } from './core/status';
export { step, Step } from './core/step';
export {
  feature,
  story,
  epic,
  severity,
  tag,
  label,
  link,
  issue,
  testcase,
  description,
  title,
  owner,
  layer,
  suite,
  subSuite,
  parentSuite,
} from './core/decorators';
export {
  attach,
  attachFile,
  attachScreenshot,
  attachJson,
  attachText,
  attachHtml,
  attachVideo,
} from './core/attachments';
export { QAgenticReporter, getReporter } from './core/reporter';
export type { TestResult, StepResult, TestRunResult } from './core/types';

// Version
export const VERSION = '0.1.0';
