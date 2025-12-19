export { S as Severity, b as Status, c as Step, u as attach, x as attachJson, w as attachScreenshot, y as attachText, e as epic, f as feature, l as label, g as severity, s as step, d as story, t as tag } from '../attachments-B2zaEsD5.mjs';

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

/**
 * Playwright reporter options.
 */
interface PlaywrightReporterOptions {
    projectName?: string;
    environment?: string;
    apiUrl?: string;
    apiKey?: string;
    outputDir?: string;
}
/**
 * Playwright Reporter class.
 */
declare class QAgenticPlaywrightReporter {
    private options;
    private reporter;
    private currentRun;
    constructor(options?: PlaywrightReporterOptions);
    onBegin(config: unknown, suite: unknown): Promise<void>;
    onTestEnd(test: PlaywrightTest, result: PlaywrightTestResult): Promise<void>;
    onEnd(result: {
        status: string;
    }): Promise<void>;
    private mapStatus;
    private extractLabels;
    private mapSteps;
    private mapAttachments;
}
interface Annotation {
    type: string;
    description?: string;
}
interface PlaywrightTest {
    title: string;
    titlePath(): string[];
    annotations?: Annotation[];
    location?: {
        file: string;
        line: number;
    };
    parent?: {
        title: string;
    };
}
interface PlaywrightTestResult {
    status: string;
    startTime: Date;
    duration: number;
    retry: number;
    error?: {
        message: string;
        stack?: string;
        name?: string;
    };
    steps: PlaywrightStep[];
    attachments: PlaywrightAttachment[];
}
interface PlaywrightStep {
    title: string;
    startTime: Date;
    duration: number;
    error?: {
        message: string;
        stack?: string;
    };
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
declare function qagenticReporter(options?: PlaywrightReporterOptions): [string, PlaywrightReporterOptions];

export { type PlaywrightReporterOptions, QAgenticPlaywrightReporter, QAgenticPlaywrightReporter as default, qagenticReporter };
