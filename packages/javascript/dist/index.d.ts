import { T as TestRunResult, a as TestResult } from './attachments-B2zaEsD5.js';
export { S as Severity, b as Status, c as Step, B as StepResult, u as attach, v as attachFile, z as attachHtml, x as attachJson, w as attachScreenshot, y as attachText, A as attachVideo, k as description, e as epic, f as feature, i as issue, l as label, n as layer, h as link, o as owner, r as parentSuite, g as severity, s as step, d as story, q as subSuite, p as suite, t as tag, j as testcase, m as title } from './attachments-B2zaEsD5.js';

/**
 * Configuration management for QAagentic SDK.
 */
/**
 * API reporting configuration.
 */
interface APIConfig {
    enabled: boolean;
    url: string;
    key?: string;
    timeout: number;
    retryCount: number;
    batchSize: number;
}
/**
 * Local file reporting configuration.
 */
interface LocalConfig {
    enabled: boolean;
    outputDir: string;
    formats: ('json' | 'html' | 'junit')[];
    cleanOnStart: boolean;
}
/**
 * Feature flags configuration.
 */
interface FeaturesConfig {
    aiAnalysis: boolean;
    failureClustering: boolean;
    flakyDetection: boolean;
    screenshots: 'always' | 'on_failure' | 'never';
    videos: 'always' | 'on_failure' | 'never';
    consoleOutput: boolean;
}
/**
 * Labels configuration.
 */
interface LabelsConfig {
    team?: string;
    component?: string;
    environment?: string;
    custom: Record<string, string>;
}
/**
 * Main configuration for QAagentic SDK.
 */
interface QAgenticConfig {
    projectName: string;
    environment: string;
    api: APIConfig;
    local: LocalConfig;
    features: FeaturesConfig;
    labels: LabelsConfig;
}
/**
 * Configure QAagentic SDK.
 */
declare function configure(options?: Partial<QAgenticConfig> & {
    projectName?: string;
    apiUrl?: string;
    apiKey?: string;
    outputDir?: string;
}): QAgenticConfig;
/**
 * Get the current configuration.
 */
declare function getConfig(): QAgenticConfig;

/**
 * Reporter classes for outputting test results to various destinations.
 */

/**
 * Main reporter that coordinates multiple output destinations.
 */
declare class QAgenticReporter {
    private static instance;
    private config;
    private reporters;
    private currentRun;
    constructor(config?: QAgenticConfig);
    /**
     * Get singleton instance.
     */
    static getInstance(config?: QAgenticConfig): QAgenticReporter;
    /**
     * Reset singleton instance.
     */
    static reset(): void;
    /**
     * Start a new test run.
     */
    startRun(options?: Partial<TestRunResult>): Promise<TestRunResult>;
    /**
     * End the current test run.
     */
    endRun(): Promise<TestRunResult | null>;
    /**
     * Report a test result.
     */
    reportTest(test: TestResult): Promise<void>;
    /**
     * Get the current test run.
     */
    getCurrentRun(): TestRunResult | null;
}
/**
 * Get the global reporter instance.
 */
declare function getReporter(config?: QAgenticConfig): QAgenticReporter;

/**
 * QAagentic SDK - AI-Powered Test Intelligence Platform
 *
 * A next-generation test reporting library that brings AI-powered insights
 * to your test automation. Works with Cypress, Playwright, Jest, and more.
 *
 * @example
 * ```typescript
 * import { feature, story, step, severity, Severity } from '@qagentic/reporter';
 *
 * describe('User Authentication', { feature: 'Authentication' }, () => {
 *   it('should login successfully', { severity: 'critical' }, () => {
 *     step('Enter credentials', () => {
 *       // test code
 *     });
 *   });
 * });
 * ```
 */

declare const VERSION = "0.1.0";

export { type QAgenticConfig, QAgenticReporter, TestResult, TestRunResult, VERSION, configure, getConfig, getReporter };
