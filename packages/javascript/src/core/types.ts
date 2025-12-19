/**
 * Core type definitions for QAagentic SDK.
 */

import { Severity } from './severity';
import { Status } from './status';

/**
 * Test step result.
 */
export interface StepResult {
  id: string;
  name: string;
  status: Status;
  startTime?: Date;
  endTime?: Date;
  durationMs: number;
  error?: string;
  errorTrace?: string;
  attachments: Attachment[];
  children: StepResult[];
  parameters: Record<string, unknown>;
}

/**
 * Attachment data.
 */
export interface Attachment {
  id: string;
  name: string;
  type: string;
  extension?: string;
  content: string;
  size: number;
  timestamp: string;
}

/**
 * Test labels and metadata.
 */
export interface TestLabels {
  feature?: string;
  story?: string;
  epic?: string;
  severity?: Severity;
  tags?: string[];
  owner?: string;
  layer?: string;
  suite?: string;
  subSuite?: string;
  parentSuite?: string;
  [key: string]: unknown;
}

/**
 * Link to external resource.
 */
export interface TestLink {
  url: string;
  name: string;
  type: 'link' | 'issue' | 'tms';
}

/**
 * Complete test result.
 */
export interface TestResult {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  status: Status;
  startTime?: Date;
  endTime?: Date;
  durationMs: number;
  errorMessage?: string;
  errorType?: string;
  stackTrace?: string;
  labels: TestLabels;
  links: TestLink[];
  parameters: Record<string, unknown>;
  steps: StepResult[];
  attachments: Attachment[];
  filePath?: string;
  lineNumber?: number;
  retryCount: number;
  isRetry: boolean;
  isFlaky: boolean;
  flakyReason?: string;
}

/**
 * Test run result containing multiple tests.
 */
export interface TestRunResult {
  id: string;
  name: string;
  projectName: string;
  environment: string;
  startTime?: Date;
  endTime?: Date;
  durationMs: number;
  tests: TestResult[];
  total: number;
  passed: number;
  failed: number;
  broken: number;
  skipped: number;
  passRate: number;
  labels: Record<string, unknown>;
  parameters: Record<string, unknown>;
  ciBuildId?: string;
  ciBuildUrl?: string;
  branch?: string;
  commitHash?: string;
}

/**
 * Reporter options.
 */
export interface ReporterOptions {
  projectName?: string;
  environment?: string;
  apiUrl?: string;
  apiKey?: string;
  outputDir?: string;
  formats?: ('json' | 'html' | 'junit')[];
  consoleOutput?: boolean;
  aiAnalysis?: boolean;
}
