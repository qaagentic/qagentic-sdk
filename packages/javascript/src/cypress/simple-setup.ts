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

      if (test.state === 'failed') {
        // Try multiple ways to get error information
        const errorInfo = test.err || test.error || test.failure;
        const displayError = test.displayError;
        
        if (errorInfo) {
          testResult.errorMessage = errorInfo.message || 'Test failed';
          // Extract stack trace from various possible locations
          testResult.stackTrace = errorInfo.stack || 
                                 errorInfo.codeFrame ||
                                 errorInfo.toString() ||
                                 displayError ||
                                 '';
          testResult.errorType = errorInfo.name || 'AssertionError';
        } else if (displayError) {
          // Use displayError from Cypress test object
          testResult.errorMessage = displayError;
          // Try to extract stack from displayError if it contains it
          if (displayError.includes('\n')) {
            testResult.stackTrace = displayError;
          }
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

      }

      // Update stats
      this.stats.tests++;
      if (test.state === 'passed') this.stats.passes++;
      if (test.state === 'failed') this.stats.failures++;
      if (test.state === 'pending') this.stats.pending++;

      // Collect test result with original test object for screenshot lookup
      this.pendingTests.push({
        testResult,
        test,
      });
    } catch (error) {
      console.warn('[QAagentic] Failed to report test:', error);
    }
  }

  private pendingTests: Array<{ testResult: TestResult; test: any }> = [];

  async attachScreenshots() {
    // This is called after the spec completes, when screenshots have been written
    console.log('[QAagentic] Attaching screenshots to pending tests, count:', this.pendingTests.length);
    
    for (const { testResult, test } of this.pendingTests) {
      // Only try to attach screenshots for failed tests
      if (test.state !== 'failed') {
        console.log('[QAagentic] Skipping non-failed test:', test.title[test.title.length - 1]);
        continue;
      }
      
      // Get test file name - handle cases where invocationDetails might not be available
      let testFileName = 'login.cy.ts'; // default fallback
      if (test.invocationDetails?.relativeFile) {
        testFileName = test.invocationDetails.relativeFile.replace(/\.ts$/, '');
      }
      
      const testName = test.title[test.title.length - 1];
      console.log('[QAagentic] Processing failed test:', testName, 'from file:', testFileName);
      
      // Build the directory path where screenshots are stored
      const screenshotDir = path.join(
        process.cwd(),
        'cypress/reports/assets',
        testFileName
      );
      
      console.log('[QAagentic] Looking for screenshots in:', screenshotDir);
      
      // Check if directory exists and read files
      if (!fs.existsSync(screenshotDir)) {
        console.log('[QAagentic] Screenshot directory not found:', screenshotDir);
        continue;
      }
      
      try {
        const files = fs.readdirSync(screenshotDir);
        console.log('[QAagentic] Files in directory:', files);
        console.log('[QAagentic] Looking for test name:', testName);
        
        // Find screenshots matching this test (look for files containing the test name and "(failed)")
        const matchingScreenshots = files.filter(file => 
          file.includes(testName) && file.includes('(failed)') && file.endsWith('.png')
        );
        
        console.log('[QAagentic] Matching screenshots found:', matchingScreenshots.length, matchingScreenshots);
        
        if (matchingScreenshots.length > 0) {
          // Use the most recent one (last in the list, or the one without attempt number)
          const screenshotFile = matchingScreenshots.find(f => !f.includes('(attempt')) || matchingScreenshots[0];
          const screenshotPath = path.join(screenshotDir, screenshotFile);
          
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
            console.log('[QAagentic] Added screenshot for:', testName);
          } catch (err) {
            console.warn('[QAagentic] Failed to read screenshot:', err);
          }
        } else {
          console.log('[QAagentic] No matching screenshots found for test:', testName, 'in', screenshotDir);
        }
      } catch (err) {
        console.warn('[QAagentic] Failed to read screenshot directory:', err);
      }
    }
  }

  async sendPendingTests() {
    // Send all collected tests to the API
    console.log('[QAagentic] Sending', this.pendingTests.length, 'pending tests to API');
    
    for (const { testResult } of this.pendingTests) {
      await this.reporter.reportTest(testResult);
    }
    
    // Clear pending tests after sending
    this.pendingTests = [];
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

  // Process all tests after the entire spec completes
  on('after:spec', (_spec: any, results: any) => {
    return (async () => {
      if (!results?.tests) return;
      
      try {
        // Ensure run is started
        await reporter.ensureRunStarted();
        
        // Wait for mochawesome to write screenshots and reports
        console.log('[QAagentic] Waiting for screenshots to be written...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        // Process all tests from this spec - this collects them but doesn't send yet
        console.log('[QAagentic] Processing', results.tests.length, 'tests');
        for (const test of results.tests) {
          await reporter.onTestEnd(test);
        }
        
        // Attach screenshots after they've been written
        console.log('[QAagentic] Attaching screenshots...');
        await reporter.attachScreenshots();
        
        // Now send all tests with screenshots to the API
        console.log('[QAagentic] Sending tests with screenshots to API...');
        await reporter.sendPendingTests();
        
        // Finalize run after all tests are processed
        console.log('[QAagentic] Finalizing run...');
        await reporter.finalizeRun();
        
        // Wait for API calls to complete
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.warn('[QAagentic] Error processing spec:', error);
      }
    })();
  });
}
