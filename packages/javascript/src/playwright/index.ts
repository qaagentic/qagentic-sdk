/**
 * QAagentic Playwright Reporter
 *
 * Custom Playwright reporter that sends test results to QAagentic.
 *
 * @example
 * ```typescript
 * // playwright.config.ts
 * import { defineConfig } from '@playwright/test';
 * import { qagenticReporter } from '@qagentic/reporter/playwright';
 *
 * export default defineConfig({
 *   reporter: [
 *     ['html'],
 *     qagenticReporter({
 *       projectName: 'my-project',
 *       apiUrl: 'http://localhost:8080',
 *     }),
 *   ],
 * });
 * ```
 */

import { v4 as uuidv4 } from 'uuid';
import { configure, getConfig } from '../core/config';
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
 * Playwright reporter options.
 */
export interface PlaywrightReporterOptions {
  projectName?: string;
  environment?: string;
  apiUrl?: string;
  apiKey?: string;
  outputDir?: string;
}

/**
 * Playwright Reporter class.
 */
export class QAgenticPlaywrightReporter {
  private options: PlaywrightReporterOptions;
  private reporter: QAgenticReporter;
  private currentRun: TestRunResult | null = null;

  constructor(options: PlaywrightReporterOptions = {}) {
    this.options = options;

    // Configure QAagentic
    configure({
      projectName: options.projectName || 'playwright-project',
      environment: options.environment || 'local',
      apiUrl: options.apiUrl,
      apiKey: options.apiKey,
      outputDir: options.outputDir || './qagentic-results',
    });

    this.reporter = QAgenticReporter.getInstance();
  }

  async onBegin(config: unknown, suite: unknown): Promise<void> {
    this.currentRun = await this.reporter.startRun({
      name: `playwright_${new Date().toISOString().replace(/[:.]/g, '')}`,
      projectName: this.options.projectName || 'playwright-project',
      environment: this.options.environment || 'local',
      branch: process.env.GITHUB_REF_NAME || process.env.CI_COMMIT_REF_NAME,
      commitHash: process.env.GITHUB_SHA || process.env.CI_COMMIT_SHA,
    });
  }

  async onTestEnd(test: PlaywrightTest, result: PlaywrightTestResult): Promise<void> {
    const testResult: TestResult = {
      id: uuidv4(),
      name: test.title,
      fullName: test.titlePath().join(' > '),
      description: test.annotations?.find((a: Annotation) => a.type === 'description')?.description,
      status: this.mapStatus(result.status),
      startTime: new Date(result.startTime),
      endTime: new Date(result.startTime.getTime() + result.duration),
      durationMs: result.duration,
      labels: this.extractLabels(test),
      links: [],
      parameters: {},
      steps: this.mapSteps(result.steps),
      attachments: this.mapAttachments(result.attachments),
      filePath: test.location?.file,
      lineNumber: test.location?.line,
      retryCount: result.retry,
      isRetry: result.retry > 0,
      isFlaky: result.status === 'passed' && result.retry > 0,
    };

    if (result.error) {
      testResult.errorMessage = result.error.message;
      testResult.stackTrace = result.error.stack;
      testResult.errorType = result.error.name || 'Error';
    }

    await this.reporter.reportTest(testResult);
  }

  async onEnd(result: { status: string }): Promise<void> {
    await this.reporter.endRun();
  }

  private mapStatus(status: string): Status {
    switch (status) {
      case 'passed':
        return Status.PASSED;
      case 'failed':
        return Status.FAILED;
      case 'timedOut':
        return Status.BROKEN;
      case 'skipped':
        return Status.SKIPPED;
      case 'interrupted':
        return Status.BROKEN;
      default:
        return Status.UNKNOWN;
    }
  }

  private extractLabels(test: PlaywrightTest): Record<string, unknown> {
    const labels: Record<string, unknown> = {
      suite: test.parent?.title,
    };

    for (const annotation of test.annotations || []) {
      if (annotation.type === 'feature') labels.feature = annotation.description;
      if (annotation.type === 'story') labels.story = annotation.description;
      if (annotation.type === 'severity') labels.severity = annotation.description;
      if (annotation.type === 'tag') {
        const tags = (labels.tags as string[]) || [];
        tags.push(annotation.description || '');
        labels.tags = tags;
      }
    }

    return labels;
  }

  private mapSteps(steps: PlaywrightStep[]): TestResult['steps'] {
    return (steps || []).map((step) => ({
      id: uuidv4(),
      name: step.title,
      status: step.error ? Status.FAILED : Status.PASSED,
      startTime: new Date(step.startTime),
      endTime: new Date(step.startTime.getTime() + step.duration),
      durationMs: step.duration,
      error: step.error?.message,
      errorTrace: step.error?.stack,
      attachments: [],
      children: this.mapSteps(step.steps || []),
      parameters: {},
    }));
  }

  private mapAttachments(attachments: PlaywrightAttachment[]): TestResult['attachments'] {
    return (attachments || []).map((att) => ({
      id: uuidv4(),
      name: att.name,
      type: att.contentType,
      content: att.path || '',
      size: 0,
      timestamp: new Date().toISOString(),
    }));
  }
}

// Type definitions for Playwright objects
interface Annotation {
  type: string;
  description?: string;
}

interface PlaywrightTest {
  title: string;
  titlePath(): string[];
  annotations?: Annotation[];
  location?: { file: string; line: number };
  parent?: { title: string };
}

interface PlaywrightTestResult {
  status: string;
  startTime: Date;
  duration: number;
  retry: number;
  error?: { message: string; stack?: string; name?: string };
  steps: PlaywrightStep[];
  attachments: PlaywrightAttachment[];
}

interface PlaywrightStep {
  title: string;
  startTime: Date;
  duration: number;
  error?: { message: string; stack?: string };
  steps?: PlaywrightStep[];
}

interface PlaywrightAttachment {
  name: string;
  contentType: string;
  path?: string;
  body?: Buffer;
}

/**
 * Create a Playwright reporter configuration.
 */
export function qagenticReporter(
  options: PlaywrightReporterOptions = {}
): [string, PlaywrightReporterOptions] {
  return ['@qagentic/reporter/playwright', options];
}

// Default export
export default QAgenticPlaywrightReporter;
