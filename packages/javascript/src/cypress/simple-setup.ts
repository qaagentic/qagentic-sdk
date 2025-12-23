/**
 * QAagentic Cypress - Simplified Setup
 * 
 * One-line integration for Cypress projects
 * No complex configuration needed!
 * 
 * @example
 * ```typescript
 * // cypress.config.ts - Just add this one line!
 * import { setupQAgentic } from '@qagentic/reporter/cypress/simple-setup';
 * 
 * export default defineConfig({
 *   e2e: {
 *     setupNodeEvents(on, config) {
 *       setupQAgentic(on, config);  // That's it!
 *       return config;
 *     },
 *   },
 * });
 * ```
 */

import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { configure } from '../core/config';
import { QAgenticReporter } from '../core/reporter';
import { parseStatus } from '../core/status';
import type { TestResult, TestRunResult } from '../core/types';

/**
 * Simplified QAagentic setup for Cypress
 * Auto-detects configuration from environment variables
 * Zero manual configuration needed!
 */
class QAgenticCypressReporter {
  private reporter: QAgenticReporter;
  private currentRun: TestRunResult | null = null;
  private projectName: string;
  private environment: string;
  private runStarted = false;
  private runFinalized = false;
  private stats = {
    suites: 0,
    tests: 0,
    passes: 0,
    pending: 0,
    failures: 0,
    start: new Date(),
    end: new Date(),
    duration: 0
  };

  constructor(config: any) {
    // Auto-configure from environment or defaults
    this.projectName = process.env.QAGENTIC_PROJECT_NAME || 
                      config.projectId || 
                      'Cypress E2E Tests';
    
    this.environment = process.env.QAGENTIC_ENVIRONMENT || 
                      process.env.NODE_ENV || 
                      'e2e';
    
    const apiUrl = process.env.QAGENTIC_API_URL || 
                  'http://localhost:8080';

    // Configure QAagentic
    configure({
      projectName: this.projectName,
      environment: this.environment,
      apiUrl,
      outputDir: './qagentic-results',
    });

    this.reporter = QAgenticReporter.getInstance();
    this.stats.start = new Date();
  }

  async onRunBegin() {
    try {
      console.log('[QAagentic] onRunBegin called, calling reporter.startRun()');
      this.currentRun = await this.reporter.startRun({
        name: this.projectName,
        projectName: this.projectName,
        environment: this.environment,
        startTime: this.stats.start,
      });
      console.log('[QAagentic] onRunBegin completed, currentRun:', this.currentRun?.id);
    } catch (error) {
      console.warn('[QAagentic] Failed to start run:', error);
    }
  }

  async ensureRunStarted() {
    if (this.runStarted) return;
    
    this.runStarted = true;
    console.log('[QAagentic] Ensuring run is started');
    try {
      await this.onRunBegin();
      console.log('[QAagentic] Run started successfully');
    } catch (error) {
      console.warn('[QAagentic] Failed to start run:', error);
    }
  }

  async onTestEnd(test: any) {
    // Ensure run is started before processing tests
    await this.ensureRunStarted();
    
    if (!this.currentRun) return;

    try {
      const testResult: TestResult = {
        id: uuidv4(),
        name: test.title[test.title.length - 1],
        fullName: test.title.join(' > '),
        status: parseStatus(test.state),
        durationMs: test.duration,
        startTime: new Date(Date.now() - test.duration),
        endTime: new Date(),
        labels: {
          suite: test.title.slice(0, -1).join(' > '),
          feature: test.title[0],
        },
        links: [],
        parameters: {},
        steps: [],
        attachments: [],
        filePath: test.invocationDetails?.relativeFile || '',
        retryCount: 0,
        isRetry: false,
        isFlaky: false,
      };

      // Capture error details for failed tests
      if (test.state === 'failed') {
        // Try multiple ways to get error information
        const errorInfo = test.err || test.error || test.failure;
        const displayError = test.displayError;
        
        if (errorInfo) {
          testResult.errorMessage = errorInfo.message || 'Test failed';
          testResult.stackTrace = errorInfo.stack || errorInfo.toString();
          testResult.errorType = errorInfo.name || 'AssertionError';
        } else if (displayError) {
          // Use displayError from Cypress test object
          testResult.errorMessage = displayError;
          testResult.errorType = 'AssertionError';
        } else {
          // Fallback: create error from test state
          testResult.errorMessage = 'Test assertion failed';
          testResult.errorType = 'AssertionError';
        }
        
        console.log('[QAagentic] Test failed - Error:', {
          message: testResult.errorMessage,
          type: testResult.errorType,
          hasStackTrace: !!testResult.stackTrace,
        });

        // Capture screenshots if available (from Cypress screenshots folder)
        if (test.invocationDetails?.relativeFile) {
          const testFileName = test.invocationDetails.relativeFile.replace(/\.ts$/, '');
          const screenshotPath = path.join(
            process.cwd(),
            'cypress/screenshots',
            `${testFileName} -- ${test.title[test.title.length - 1]} (failed).png`
          );
          
          console.log('[QAagentic] Looking for screenshot at:', screenshotPath);
          
          if (fs.existsSync(screenshotPath)) {
            try {
              const screenshotContent = fs.readFileSync(screenshotPath);
              testResult.attachments.push({
                id: uuidv4(),
                name: 'screenshot',
                type: 'image/png',
                extension: 'png',
                content: screenshotContent.toString('base64'),
                size: screenshotContent.length,
                timestamp: new Date().toISOString(),
              });
              console.log('[QAagentic] Added screenshot attachment:', screenshotPath);
            } catch (err) {
              console.warn('[QAagentic] Failed to read screenshot:', err);
            }
          } else {
            console.log('[QAagentic] Screenshot not found at:', screenshotPath);
          }
        }
      }

      // Update stats
      this.stats.tests++;
      if (test.state === 'passed') this.stats.passes++;
      if (test.state === 'failed') this.stats.failures++;
      if (test.state === 'pending') this.stats.pending++;

      await this.reporter.reportTest(testResult);
    } catch (error) {
      console.warn('[QAagentic] Failed to report test:', error);
    }
  }

  async finalizeRun() {
    if (this.runFinalized || !this.currentRun) return;
    
    this.runFinalized = true;
    console.log('[QAagentic] Finalizing run');
    
    try {
      this.stats.end = new Date();
      this.stats.duration = this.stats.end.getTime() - this.stats.start.getTime();

      // Update run with final stats
      this.currentRun.endTime = this.stats.end;
      this.currentRun.durationMs = this.stats.duration;
      this.currentRun.total = this.stats.tests;
      this.currentRun.passed = this.stats.passes;
      this.currentRun.failed = this.stats.failures;
      this.currentRun.skipped = this.stats.pending;

      console.log('[QAagentic] Calling reporter.endRun with stats:', {
        total: this.currentRun.total,
        passed: this.currentRun.passed,
        failed: this.currentRun.failed,
        skipped: this.currentRun.skipped,
      });
      
      await this.reporter.endRun();
      console.log('[QAagentic] Run finalized successfully');
    } catch (error) {
      console.warn('[QAagentic] Failed to finalize run:', error);
    }
  }

}

export function setupQAgentic(on: any, config: any): void {
  const reporter = new QAgenticCypressReporter(config);

  // Simple approach: Process tests in after:spec and finalize immediately
  on('after:spec', (_spec: any, results: any) => {
    return (async () => {
      if (!results?.tests) return;
      
      try {
        // Process all tests from this spec
        for (const test of results.tests) {
          await reporter.onTestEnd(test);
        }
        
        // Finalize run after all tests are processed
        await reporter.finalizeRun();
        
        // Wait for API calls to complete
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.warn('[QAagentic] Error processing spec:', error);
      }
    })();
  });
}
