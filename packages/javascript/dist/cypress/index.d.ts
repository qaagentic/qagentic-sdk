export { S as Severity, b as Status, c as Step, u as attach, x as attachJson, w as attachScreenshot, y as attachText, e as epic, f as feature, l as label, g as severity, s as step, d as story, t as tag } from '../attachments-B2zaEsD5.js';
export { default as setupQAgentic } from './simple-setup.js';

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
interface CypressPluginOptions {
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
declare function qagentic(on: CypressPluginEvents, config: CypressPluginConfig, options?: CypressPluginOptions): void;
/**
 * Cypress command to add a step.
 * Call this in your support file to register custom commands.
 */
declare function registerCommands(): void;

export { type CypressPluginOptions, qagentic as default, qagentic, registerCommands };
