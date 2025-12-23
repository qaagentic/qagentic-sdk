/**
 * Reporter classes for outputting test results to various destinations.
 */

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { getConfig, QAgenticConfig } from './config';
import { Status } from './status';
import type { TestResult, TestRunResult, StepResult } from './types';

/**
 * Base reporter interface.
 */
export interface BaseReporter {
  startRun(run: TestRunResult): void | Promise<void>;
  endRun(run: TestRunResult): void | Promise<void>;
  reportTest(test: TestResult): void | Promise<void>;
}

/**
 * Console reporter with colored output.
 */
export class ConsoleReporter implements BaseReporter {
  private config: QAgenticConfig;

  constructor(config?: QAgenticConfig) {
    this.config = config || getConfig();
  }

  startRun(run: TestRunResult): void {
    console.log('\n' + '='.repeat(60));
    console.log(`🚀 QAagentic Test Run - ${run.projectName}`);
    console.log(`Environment: ${run.environment}`);
    console.log('='.repeat(60) + '\n');
  }

  endRun(run: TestRunResult): void {
    const icon = run.failed === 0 ? '✅' : '❌';
    console.log('\n' + '='.repeat(60));
    console.log(`${icon} Test Run Complete - ${run.passRate.toFixed(1)}% Pass Rate`);
    console.log(`Passed: ${run.passed} | Failed: ${run.failed} | Skipped: ${run.skipped}`);
    console.log('='.repeat(60) + '\n');
  }

  reportTest(test: TestResult): void {
    if (!this.config.features.consoleOutput) return;

    const symbols: Record<Status, string> = {
      [Status.PASSED]: '✓',
      [Status.FAILED]: '✗',
      [Status.BROKEN]: '!',
      [Status.SKIPPED]: '○',
      [Status.PENDING]: '…',
      [Status.RUNNING]: '→',
      [Status.UNKNOWN]: '?',
    };

    const symbol = symbols[test.status as Status] || '?';
    console.log(`  ${symbol} ${test.name}`);

    if (test.errorMessage) {
      console.log(`    Error: ${test.errorMessage.slice(0, 100)}...`);
    }
  }
}

/**
 * JSON file reporter.
 */
export class JSONReporter implements BaseReporter {
  private config: QAgenticConfig;
  private outputDir: string;

  constructor(config?: QAgenticConfig) {
    this.config = config || getConfig();
    this.outputDir = this.config.local.outputDir;
  }

  startRun(run: TestRunResult): void {
    // Create output directory
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Clean previous results if configured
    if (this.config.local.cleanOnStart) {
      const files = fs.readdirSync(this.outputDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(this.outputDir, file));
        }
      }
    }
  }

  endRun(run: TestRunResult): void {
    if (!this.config.local.enabled || !this.config.local.formats.includes('json')) {
      return;
    }

    // Write run summary
    const runFile = path.join(this.outputDir, 'run.json');
    fs.writeFileSync(runFile, JSON.stringify(this.serializeRun(run), null, 2));

    // Write individual test results
    const testsDir = path.join(this.outputDir, 'tests');
    if (!fs.existsSync(testsDir)) {
      fs.mkdirSync(testsDir, { recursive: true });
    }

    for (const test of run.tests) {
      const testFile = path.join(testsDir, `${test.id}.json`);
      fs.writeFileSync(testFile, JSON.stringify(this.serializeTest(test), null, 2));
    }
  }

  reportTest(_test: TestResult): void {
    // Tests are written at end
  }

  private serializeRun(run: TestRunResult): Record<string, unknown> {
    return {
      ...run,
      startTime: run.startTime?.toISOString(),
      endTime: run.endTime?.toISOString(),
      tests: run.tests.map((t) => this.serializeTest(t)),
    };
  }

  private serializeTest(test: TestResult): Record<string, unknown> {
    return {
      ...test,
      startTime: test.startTime?.toISOString(),
      endTime: test.endTime?.toISOString(),
      steps: test.steps.map((s) => this.serializeStep(s)),
    };
  }

  private serializeStep(step: StepResult): Record<string, unknown> {
    return {
      ...step,
      startTime: step.startTime?.toISOString(),
      endTime: step.endTime?.toISOString(),
      children: step.children.map((c) => this.serializeStep(c)),
    };
  }
}

/**
 * JUnit XML reporter for CI/CD compatibility.
 */
export class JUnitReporter implements BaseReporter {
  private config: QAgenticConfig;
  private outputDir: string;

  constructor(config?: QAgenticConfig) {
    this.config = config || getConfig();
    this.outputDir = this.config.local.outputDir;
  }

  startRun(_run: TestRunResult): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  endRun(run: TestRunResult): void {
    if (!this.config.local.enabled || !this.config.local.formats.includes('junit')) {
      return;
    }

    const xml = this.generateXml(run);
    const junitFile = path.join(this.outputDir, 'junit.xml');
    fs.writeFileSync(junitFile, xml);
  }

  reportTest(_test: TestResult): void {
    // Tests are written at end
  }

  private generateXml(run: TestRunResult): string {
    const escape = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<testsuite name="${escape(run.projectName)}" `;
    xml += `tests="${run.total}" `;
    xml += `failures="${run.failed}" `;
    xml += `errors="${run.broken}" `;
    xml += `skipped="${run.skipped}" `;
    xml += `time="${(run.durationMs / 1000).toFixed(3)}" `;
    xml += `timestamp="${run.startTime?.toISOString() || ''}">\n`;

    for (const test of run.tests) {
      xml += `  <testcase name="${escape(test.name)}" `;
      xml += `classname="${escape(test.fullName)}" `;
      xml += `time="${(test.durationMs / 1000).toFixed(3)}"`;

      if (test.status === Status.PASSED) {
        xml += '/>\n';
      } else if (test.status === Status.FAILED) {
        xml += '>\n';
        xml += `    <failure message="${escape(test.errorMessage || 'Test failed')}" `;
        xml += `type="${escape(test.errorType || 'AssertionError')}">`;
        if (test.stackTrace) {
          xml += escape(test.stackTrace);
        }
        xml += '</failure>\n';
        xml += '  </testcase>\n';
      } else if (test.status === Status.BROKEN) {
        xml += '>\n';
        xml += `    <error message="${escape(test.errorMessage || 'Test error')}" `;
        xml += `type="${escape(test.errorType || 'Error')}">`;
        if (test.stackTrace) {
          xml += escape(test.stackTrace);
        }
        xml += '</error>\n';
        xml += '  </testcase>\n';
      } else if (test.status === Status.SKIPPED) {
        xml += '>\n';
        xml += `    <skipped${test.errorMessage ? ` message="${escape(test.errorMessage)}"` : ''}/>\n`;
        xml += '  </testcase>\n';
      } else {
        xml += '/>\n';
      }
    }

    xml += '</testsuite>\n';
    return xml;
  }
}

/**
 * API reporter that sends results to QAagentic server.
 */
export class APIReporter implements BaseReporter {
  private config: QAgenticConfig;
  private batch: TestResult[] = [];
  private currentRun?: TestRunResult;

  constructor(config?: QAgenticConfig) {
    this.config = config || getConfig();
  }

  async startRun(run: TestRunResult): Promise<void> {
    if (!this.config.api.enabled) {
      console.log('[APIReporter] API reporting disabled');
      return;
    }

    this.currentRun = run;
    this.batch = [];

    try {
      console.log('[APIReporter] Starting test run:', run.id);
      const url = `${this.config.api.url}/api/v1/runs`;
      console.log('[APIReporter] POST to:', url);
      
      const response = await axios.post(
        url,
        {
          id: run.id,
          name: run.name,
          project_name: run.projectName,
          environment: run.environment,
          start_time: run.startTime?.toISOString(),
          labels: run.labels,
          ci_build_id: run.ciBuildId,
          branch: run.branch,
          commit_hash: run.commitHash,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.config.api.key || '',
            'X-Project': this.config.projectName,
          },
          timeout: this.config.api.timeout,
        }
      );
      console.log('[APIReporter] Test run started successfully:', response.status);
    } catch (error: any) {
      console.warn('[APIReporter] Failed to register run with API:');
      console.warn('  Error:', error.message);
      console.warn('  Status:', error.response?.status);
      console.warn('  Data:', error.response?.data);
    }
  }

  async endRun(run: TestRunResult): Promise<void> {
    if (!this.config.api.enabled) return;

    try {
      console.log('[APIReporter] endRun called, batch size:', this.batch.length);
      
      // Flush remaining batch - ALWAYS flush, even if batch is not full
      if (this.batch.length > 0) {
        console.log('[APIReporter] Flushing remaining', this.batch.length, 'test results');
        await this.flushBatch();
        console.log('[APIReporter] Batch flushed, waiting for processing...');
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      console.log('[APIReporter] Finalizing run with test counts:', {
        total: run.total,
        passed: run.passed,
        failed: run.failed,
        broken: run.broken,
        skipped: run.skipped,
      });
      
      const patchData = {
        end_time: run.endTime?.toISOString(),
        duration_ms: run.durationMs,
        total: run.total,
        passed: run.passed,
        failed: run.failed,
        broken: run.broken,
        skipped: run.skipped,
        status: 'completed',
      };
      
      console.log('[APIReporter] PATCH to:', `${this.config.api.url}/api/v1/runs/${run.id}`);
      console.log('[APIReporter] PATCH data:', patchData);
      
      const response = await axios.patch(
        `${this.config.api.url}/api/v1/runs/${run.id}`,
        patchData,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.config.api.key || '',
            'X-Project': this.config.projectName,
          },
          timeout: this.config.api.timeout,
        }
      );
      console.log('[APIReporter] Run finalized successfully:', response.status);
    } catch (error: any) {
      console.warn('[APIReporter] Failed to finalize run with API:');
      console.warn('  Error:', error.message);
      console.warn('  Status:', error.response?.status);
      console.warn('  Data:', error.response?.data);
    }
  }

  async reportTest(test: TestResult): Promise<void> {
    console.log('[APIReporter] reportTest called for:', test.name, 'API enabled:', this.config.api.enabled);
    if (!this.config.api.enabled) {
      console.log('[APIReporter] API reporting disabled, skipping test report');
      return;
    }

    console.log('[APIReporter] Adding test to batch:', test.name, '- batch size:', this.batch.length + 1);
    this.batch.push(test);

    if (this.batch.length >= this.config.api.batchSize) {
      console.log('[APIReporter] Batch size reached, flushing batch');
      await this.flushBatch();
    } else {
      console.log('[APIReporter] Batch size:', this.batch.length, '/', this.config.api.batchSize);
    }
  }

  private async flushBatch(): Promise<void> {
    if (this.batch.length === 0 || !this.currentRun) return;

    try {
      console.log('[APIReporter] Flushing batch of', this.batch.length, 'test results');
      const response = await axios.post(
        `${this.config.api.url}/api/v1/runs/${this.currentRun.id}/results`,
        this.batch.map((t) => ({
          id: t.id,
          name: t.name,
          full_name: t.fullName,
          status: t.status,
          duration_ms: t.durationMs,
          start_time: t.startTime?.toISOString(),
          end_time: t.endTime?.toISOString(),
          file_path: t.filePath,
          error_message: t.errorMessage,
          stack_trace: t.stackTrace,
          error_type: t.errorType,
          attachments: t.attachments,
        })),
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.config.api.key || '',
          },
          timeout: this.config.api.timeout,
        }
      );
      console.log('[APIReporter] Batch flushed successfully:', response.status);
    } catch (error: any) {
      console.warn('[APIReporter] Failed to send test results to API:');
      console.warn('  Error:', error.message);
      console.warn('  Status:', error.response?.status);
      console.warn('  Data:', error.response?.data);
    } finally {
      this.batch = [];
    }
  }
}

/**
 * Main reporter that coordinates multiple output destinations.
 */
export class QAgenticReporter {
  private static instance: QAgenticReporter | null = null;
  private config: QAgenticConfig;
  private reporters: BaseReporter[] = [];
  private currentRun: TestRunResult | null = null;

  constructor(config?: QAgenticConfig) {
    this.config = config || getConfig();

    console.log('[QAgenticReporter] Initializing with config:', {
      projectName: this.config.projectName,
      environment: this.config.environment,
      apiEnabled: this.config.api.enabled,
      apiUrl: this.config.api.url,
    });

    // Initialize reporters based on config
    if (this.config.features.consoleOutput) {
      this.reporters.push(new ConsoleReporter(this.config));
      console.log('[QAgenticReporter] Added ConsoleReporter');
    }

    if (this.config.local.enabled) {
      this.reporters.push(new JSONReporter(this.config));
      console.log('[QAgenticReporter] Added JSONReporter');
      if (this.config.local.formats.includes('junit')) {
        this.reporters.push(new JUnitReporter(this.config));
        console.log('[QAgenticReporter] Added JUnitReporter');
      }
    }

    if (this.config.api.enabled) {
      this.reporters.push(new APIReporter(this.config));
      console.log('[QAgenticReporter] Added APIReporter');
    }

    console.log('[QAgenticReporter] Initialization complete with', this.reporters.length, 'reporters');
  }

  /**
   * Get singleton instance.
   */
  static getInstance(config?: QAgenticConfig): QAgenticReporter {
    if (!QAgenticReporter.instance) {
      QAgenticReporter.instance = new QAgenticReporter(config);
    }
    return QAgenticReporter.instance;
  }

  /**
   * Reset singleton instance.
   */
  static reset(): void {
    QAgenticReporter.instance = null;
  }

  /**
   * Start a new test run.
   */
  async startRun(options: Partial<TestRunResult> = {}): Promise<TestRunResult> {
    this.currentRun = {
      id: options.id || uuidv4(),
      name: options.name || `run_${new Date().toISOString().replace(/[:.]/g, '')}`,
      projectName: options.projectName || this.config.projectName,
      environment: options.environment || this.config.environment,
      startTime: new Date(),
      durationMs: 0,
      tests: [],
      total: 0,
      passed: 0,
      failed: 0,
      broken: 0,
      skipped: 0,
      passRate: 0,
      labels: { ...this.config.labels.custom, ...options.labels },
      parameters: options.parameters || {},
      ciBuildId: options.ciBuildId,
      ciBuildUrl: options.ciBuildUrl,
      branch: options.branch,
      commitHash: options.commitHash,
    };

    for (const reporter of this.reporters) {
      await reporter.startRun(this.currentRun);
    }

    return this.currentRun;
  }

  /**
   * End the current test run.
   */
  async endRun(): Promise<TestRunResult | null> {
    if (!this.currentRun) return null;

    this.currentRun.endTime = new Date();
    this.currentRun.durationMs =
      this.currentRun.endTime.getTime() - (this.currentRun.startTime?.getTime() || 0);
    this.currentRun.passRate =
      this.currentRun.total > 0 ? (this.currentRun.passed / this.currentRun.total) * 100 : 0;

    for (const reporter of this.reporters) {
      await reporter.endRun(this.currentRun);
    }

    const run = this.currentRun;
    this.currentRun = null;
    return run;
  }

  /**
   * Report a test result.
   */
  async reportTest(test: TestResult): Promise<void> {
    if (!this.currentRun) {
      console.warn('[QAgenticReporter] No active run to report test');
      return;
    }

    this.currentRun.tests.push(test);
    this.currentRun.total++;

    switch (test.status) {
      case 'passed':
        this.currentRun.passed++;
        break;
      case 'failed':
        this.currentRun.failed++;
        break;
      case 'broken':
        this.currentRun.broken++;
        break;
      case 'skipped':
        this.currentRun.skipped++;
        break;
    }

    console.log('[QAgenticReporter] Test counts:', {
      total: this.currentRun.total,
      passed: this.currentRun.passed,
      failed: this.currentRun.failed,
      broken: this.currentRun.broken,
      skipped: this.currentRun.skipped,
    });

    for (const reporter of this.reporters) {
      await reporter.reportTest(test);
    }
  }

  /**
   * Get the current test run.
   */
  getCurrentRun(): TestRunResult | null {
    return this.currentRun;
  }
}

/**
 * Get the global reporter instance.
 */
export function getReporter(config?: QAgenticConfig): QAgenticReporter {
  return QAgenticReporter.getInstance(config);
}
