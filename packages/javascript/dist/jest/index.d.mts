export { S as Severity, b as Status, c as Step, u as attach, x as attachJson, w as attachScreenshot, y as attachText, e as epic, f as feature, l as label, g as severity, s as step, d as story, t as tag } from '../attachments-B2zaEsD5.mjs';

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

/**
 * Jest reporter options.
 */
interface JestReporterOptions {
    projectName?: string;
    environment?: string;
    apiUrl?: string;
    apiKey?: string;
    outputDir?: string;
}
/**
 * Jest Reporter class.
 */
declare class QAgenticJestReporter {
    private options;
    private reporter;
    private globalConfig;
    constructor(globalConfig: unknown, options?: JestReporterOptions);
    onRunStart(): Promise<void>;
    onTestResult(_test: unknown, testResult: JestTestResult, _aggregatedResult: unknown): Promise<void>;
    onRunComplete(): Promise<void>;
    private mapStatus;
}
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

export { type JestReporterOptions, QAgenticJestReporter as default };
