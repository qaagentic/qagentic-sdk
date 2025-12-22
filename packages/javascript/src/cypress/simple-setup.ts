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
import { configure } from '../core/config';
import { QAgenticReporter } from '../core/reporter';
import { parseStatus } from '../core/status';
import type { TestResult, TestRunResult } from '../core/types';

/**
 * Simplified QAagentic setup for Cypress
 * Auto-detects configuration from environment variables
 * Zero manual configuration needed!
 */
export function setupQAgentic(on: any, config: any): void {
  // Auto-configure from environment or defaults
  const projectName = process.env.QAGENTIC_PROJECT_NAME || 
                     config.projectId || 
                     'Cypress E2E Tests';
  
  const environment = process.env.QAGENTIC_ENVIRONMENT || 
                     process.env.NODE_ENV || 
                     'e2e';
  
  const apiUrl = process.env.QAGENTIC_API_URL || 
                'http://localhost:8080';

  // Configure QAagentic
  configure({
    projectName,
    environment,
    apiUrl,
    outputDir: './qagentic-results',
  });

  const reporter = QAgenticReporter.getInstance();
  let currentRun: TestRunResult | null = null;

  // Start test run
  on('before:run', async () => {
    try {
      currentRun = await reporter.startRun({
        name: `cypress_${new Date().toISOString().replace(/[:.]/g, '')}`,
        projectName,
        environment,
      });
      console.log('[QAagentic] Test run started successfully');
    } catch (error) {
      console.warn('[QAagentic] Failed to start run:', error);
    }
  });

  // Capture test results
  on('after:spec', async (_spec: any, results: any) => {
    if (!results?.tests) return;

    for (const test of results.tests) {
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
          filePath: results.spec.relative,
          retryCount: 0,
          isRetry: false,
          isFlaky: false,
        };

        if (test.err) {
          testResult.errorMessage = test.err.message;
          testResult.stackTrace = test.err.stack;
          testResult.errorType = 'AssertionError';
        }

        await reporter.reportTest(testResult);
      } catch (error) {
        console.warn('[QAagentic] Failed to report test:', error);
      }
    }
  });

  // End test run
  on('after:run', async () => {
    try {
      await reporter.endRun();
      console.log('[QAagentic] Test run completed');
    } catch (error) {
      console.warn('[QAagentic] Failed to end run:', error);
    }
  });
}

export default setupQAgentic;
