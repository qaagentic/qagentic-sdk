/**
 * QAagentic Cypress Plugin
 *
 * Automatically captures test results from Cypress and reports to QAagentic.
 *
 * @example
 * ```javascript
 * // cypress.config.js
 * const { qagentic } = require('@qagentic/reporter/cypress');
 *
 * module.exports = defineConfig({
 *   e2e: {
 *     setupNodeEvents(on, config) {
 *       qagentic(on, config);
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
 * Cypress plugin events interface.
 */
interface CypressPluginEvents {
  (action: 'before:run', fn: (details: BeforeRunDetails) => void | Promise<void>): void;
  (action: 'after:spec', fn: (spec: unknown, results: CypressSpecResult) => void | Promise<void>): void;
  (action: 'after:run', fn: () => void | Promise<void>): void;
}

/**
 * Cypress plugin config interface.
 */
interface CypressPluginConfig {
  projectId?: string;
  env?: Record<string, string>;
}

/**
 * Before run details.
 */
interface BeforeRunDetails {
  config?: CypressPluginConfig;
}

/**
 * Cypress plugin options.
 */
export interface CypressPluginOptions {
  projectName?: string;
  environment?: string;
  apiUrl?: string;
  apiKey?: string;
  outputDir?: string;
  screenshotsOnFailure?: boolean;
  videosOnFailure?: boolean;
}

/**
 * Cypress test result from after:spec event.
 */
interface CypressTestResult {
  title: string[];
  state: string;
  duration: number;
  err?: {
    message: string;
    stack?: string;
  };
}

interface CypressSpecResult {
  stats: {
    tests: number;
    passes: number;
    failures: number;
    pending: number;
    skipped: number;
    duration: number;
  };
  tests: CypressTestResult[];
  spec: {
    name: string;
    relative: string;
    absolute: string;
  };
}

/**
 * Main Cypress plugin setup function.
 */
export function qagentic(
  on: CypressPluginEvents,
  config: CypressPluginConfig,
  options: CypressPluginOptions = {}
): void {
  // Configure QAagentic
  configure({
    projectName: options.projectName || config.projectId || 'cypress-project',
    environment: options.environment || config.env?.QAGENTIC_ENVIRONMENT || 'local',
    apiUrl: options.apiUrl || config.env?.QAGENTIC_API_URL,
    apiKey: options.apiKey || config.env?.QAGENTIC_API_KEY,
    outputDir: options.outputDir || './qagentic-results',
  });

  const reporter = QAgenticReporter.getInstance();
  let currentRun: TestRunResult | null = null;

  // Start run before all specs
  on('before:run', async (details: BeforeRunDetails) => {
    currentRun = await reporter.startRun({
      name: `cypress_${new Date().toISOString().replace(/[:.]/g, '')}`,
      projectName: options.projectName || details.config?.projectId || 'cypress-project',
      environment: options.environment || 'local',
      branch: details.config?.env?.BRANCH || process.env.BRANCH,
      commitHash: details.config?.env?.COMMIT || process.env.COMMIT,
    });
  });

  // Process each spec result
  on('after:spec', async (_spec: unknown, results: CypressSpecResult) => {
    if (!results || !results.tests) return;

    for (const test of results.tests) {
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
    }
  });

  // End run after all specs
  on('after:run', async () => {
    await reporter.endRun();
  });
}

/**
 * Cypress command to add a step.
 * Call this in your support file to register custom commands.
 */
export function registerCommands(): void {
  // This function should be called from cypress/support/e2e.js
  // where Cypress globals are available
  // Example:
  // import { registerCommands } from '@qagentic/reporter/cypress';
  // registerCommands();
}

// Export simplified setup
export { setupQAgentic } from './simple-setup';

// Default export
export default qagentic;
