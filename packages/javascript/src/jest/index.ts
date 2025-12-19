/**
 * QAagentic Jest Reporter
 *
 * Custom Jest reporter that sends test results to QAagentic.
 *
 * @example
 * ```javascript
 * // jest.config.js
 * module.exports = {
 *   reporters: [
 *     'default',
 *     ['@qagentic/reporter/jest', {
 *       projectName: 'my-project',
 *       apiUrl: 'http://localhost:8080',
 *     }],
 *   ],
 * };
 * ```
 */

import { v4 as uuidv4 } from 'uuid';
import { configure } from '../core/config';
import { QAgenticReporter } from '../core/reporter';
import { Status } from '../core/status';
import type { TestResult, TestRunResult } from '../core/types';

// Re-export core utilities
export { step, Step } from '../core/step';
export { Severity } from '../core/severity';
export { Status } from '../core/status';
export {
  feature,
  story,
  epic,
  severity,
  tag,
  label,
} from '../core/decorators';
export {
  attach,
  attachScreenshot,
  attachJson,
  attachText,
} from '../core/attachments';

/**
 * Jest reporter options.
 */
export interface JestReporterOptions {
  projectName?: string;
  environment?: string;
  apiUrl?: string;
  apiKey?: string;
  outputDir?: string;
}

/**
 * Jest Reporter class.
 */
export default class QAgenticJestReporter {
  private options: JestReporterOptions;
  private reporter: QAgenticReporter;
  private globalConfig: unknown;

  constructor(globalConfig: unknown, options: JestReporterOptions = {}) {
    this.globalConfig = globalConfig;
    this.options = options;

    // Configure QAagentic
    configure({
      projectName: options.projectName || 'jest-project',
      environment: options.environment || 'local',
      apiUrl: options.apiUrl,
      apiKey: options.apiKey,
      outputDir: options.outputDir || './qagentic-results',
    });

    this.reporter = QAgenticReporter.getInstance();
  }

  async onRunStart(): Promise<void> {
    await this.reporter.startRun({
      name: `jest_${new Date().toISOString().replace(/[:.]/g, '')}`,
      projectName: this.options.projectName || 'jest-project',
      environment: this.options.environment || 'local',
      branch: process.env.GITHUB_REF_NAME || process.env.CI_COMMIT_REF_NAME,
      commitHash: process.env.GITHUB_SHA || process.env.CI_COMMIT_SHA,
    });
  }

  async onTestResult(
    _test: unknown,
    testResult: JestTestResult,
    _aggregatedResult: unknown
  ): Promise<void> {
    for (const result of testResult.testResults) {
      const test: TestResult = {
        id: uuidv4(),
        name: result.title,
        fullName: result.fullName,
        status: this.mapStatus(result.status),
        startTime: new Date(testResult.perfStats.start),
        endTime: new Date(testResult.perfStats.end),
        durationMs: result.duration || 0,
        labels: {
          suite: result.ancestorTitles.join(' > '),
          feature: result.ancestorTitles[0],
        },
        links: [],
        parameters: {},
        steps: [],
        attachments: [],
        filePath: testResult.testFilePath,
        retryCount: result.numPassingAsserts || 0,
        isRetry: false,
        isFlaky: false,
      };

      if (result.failureMessages && result.failureMessages.length > 0) {
        test.errorMessage = result.failureMessages[0];
        test.stackTrace = result.failureMessages.join('\n');
        test.errorType = 'AssertionError';
      }

      await this.reporter.reportTest(test);
    }
  }

  async onRunComplete(): Promise<void> {
    await this.reporter.endRun();
  }

  private mapStatus(status: string): Status {
    switch (status) {
      case 'passed':
        return Status.PASSED;
      case 'failed':
        return Status.FAILED;
      case 'pending':
      case 'skipped':
      case 'todo':
        return Status.SKIPPED;
      default:
        return Status.UNKNOWN;
    }
  }
}

// Type definitions for Jest objects
interface JestTestResult {
  testFilePath: string;
  testResults: Array<{
    title: string;
    fullName: string;
    status: string;
    duration: number | null;
    ancestorTitles: string[];
    failureMessages: string[];
    numPassingAsserts: number;
  }>;
  perfStats: {
    start: number;
    end: number;
  };
}
