/**
 * Test severity levels - compatible with Allure.
 */
declare enum Severity {
    BLOCKER = "blocker",
    CRITICAL = "critical",
    NORMAL = "normal",
    MINOR = "minor",
    TRIVIAL = "trivial"
}

/**
 * Test execution status.
 */
declare enum Status {
    PASSED = "passed",
    FAILED = "failed",
    BROKEN = "broken",
    SKIPPED = "skipped",
    PENDING = "pending",
    RUNNING = "running",
    UNKNOWN = "unknown"
}

/**
 * Core type definitions for QAagentic SDK.
 */

/**
 * Test step result.
 */
interface StepResult {
    id: string;
    name: string;
    status: Status;
    startTime?: Date;
    endTime?: Date;
    durationMs: number;
    error?: string;
    errorTrace?: string;
    attachments: Attachment[];
    children: StepResult[];
    parameters: Record<string, unknown>;
}
/**
 * Attachment data.
 */
interface Attachment {
    id: string;
    name: string;
    type: string;
    extension?: string;
    content: string;
    size: number;
    timestamp: string;
}
/**
 * Test labels and metadata.
 */
interface TestLabels {
    feature?: string;
    story?: string;
    epic?: string;
    severity?: Severity;
    tags?: string[];
    owner?: string;
    layer?: string;
    suite?: string;
    subSuite?: string;
    parentSuite?: string;
    [key: string]: unknown;
}
/**
 * Link to external resource.
 */
interface TestLink {
    url: string;
    name: string;
    type: 'link' | 'issue' | 'tms';
}
/**
 * Complete test result.
 */
interface TestResult {
    id: string;
    name: string;
    fullName: string;
    description?: string;
    status: Status;
    startTime?: Date;
    endTime?: Date;
    durationMs: number;
    errorMessage?: string;
    errorType?: string;
    stackTrace?: string;
    labels: TestLabels;
    links: TestLink[];
    parameters: Record<string, unknown>;
    steps: StepResult[];
    attachments: Attachment[];
    filePath?: string;
    lineNumber?: number;
    retryCount: number;
    isRetry: boolean;
    isFlaky: boolean;
    flakyReason?: string;
}
/**
 * Test run result containing multiple tests.
 */
interface TestRunResult {
    id: string;
    name: string;
    projectName: string;
    environment: string;
    startTime?: Date;
    endTime?: Date;
    durationMs: number;
    tests: TestResult[];
    total: number;
    passed: number;
    failed: number;
    broken: number;
    skipped: number;
    passRate: number;
    labels: Record<string, unknown>;
    parameters: Record<string, unknown>;
    ciBuildId?: string;
    ciBuildUrl?: string;
    branch?: string;
    commitHash?: string;
}

/**
 * Step context manager for defining test steps.
 */

/**
 * Represents a test step with timing and status tracking.
 */
declare class Step {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    status: Status;
    startTime?: Date;
    endTime?: Date;
    durationMs: number;
    error?: string;
    errorTrace?: string;
    attachments: Attachment[];
    children: Step[];
    parameters: Record<string, unknown>;
    constructor(name: string, description?: string, parameters?: Record<string, unknown>);
    /**
     * Start the step.
     */
    start(): this;
    /**
     * End the step.
     */
    end(error?: Error): this;
    /**
     * Attach data to this step.
     */
    attach(data: string | Buffer, name: string, type?: string): this;
    /**
     * Attach a screenshot.
     */
    attachScreenshot(path: string, name?: string): this;
    /**
     * Attach JSON data.
     */
    attachJson(data: unknown, name?: string): this;
    /**
     * Set a step parameter.
     */
    setParameter(name: string, value: unknown): this;
    /**
     * Convert to result object.
     */
    toResult(): StepResult;
}
/**
 * Execute a function within a step context.
 *
 * @example
 * ```typescript
 * step('Login to application', () => {
 *   // test code
 * });
 *
 * await step('Async operation', async () => {
 *   await someAsyncOperation();
 * });
 * ```
 */
declare function step<T>(name: string, fn: () => T): T;
declare function step<T>(name: string, description: string, fn: () => T): T;

/**
 * Decorators for annotating tests with metadata.
 * Compatible with Allure-style annotations.
 */

/**
 * Mark test with a feature label.
 */
declare function feature(name: string): <T extends object>(target: T) => T;
/**
 * Mark test with a user story label.
 */
declare function story(name: string): <T extends object>(target: T) => T;
/**
 * Mark test with an epic label.
 */
declare function epic(name: string): <T extends object>(target: T) => T;
/**
 * Mark test with a severity level.
 */
declare function severity(level: Severity | string): <T extends object>(target: T) => T;
/**
 * Add tags to a test.
 */
declare function tag(...tags: string[]): <T extends object>(target: T) => T;
/**
 * Add a custom label to a test.
 */
declare function label(name: string, value: string): <T extends object>(target: T) => T;
/**
 * Add a link to a test.
 */
declare function link(url: string, name?: string, type?: string): <T extends object>(target: T) => T;
/**
 * Link test to an issue tracker.
 */
declare function issue(url: string, name?: string): <T extends object>(target: T) => T;
/**
 * Link test to a test management system.
 */
declare function testcase(url: string, name?: string): <T extends object>(target: T) => T;
/**
 * Add a description to a test.
 */
declare function description(text: string): <T extends object>(target: T) => T;
/**
 * Set a custom title for the test.
 */
declare function title(name: string): <T extends object>(target: T) => T;
/**
 * Set the test owner.
 */
declare function owner(name: string): <T extends object>(target: T) => T;
/**
 * Set the test layer.
 */
declare function layer(name: string): <T extends object>(target: T) => T;
/**
 * Set the suite name.
 */
declare function suite(name: string): <T extends object>(target: T) => T;
/**
 * Set the sub-suite name.
 */
declare function subSuite(name: string): <T extends object>(target: T) => T;
/**
 * Set the parent suite name.
 */
declare function parentSuite(name: string): <T extends object>(target: T) => T;

/**
 * Attachment utilities for adding files, screenshots, and data to test reports.
 */

/**
 * Attach data to the current test or step.
 */
declare function attach(data: string | Buffer, name: string, type?: string, extension?: string): string;
/**
 * Attach a file to the current test.
 */
declare function attachFile(filePath: string, name?: string): string;
/**
 * Attach a screenshot to the current test.
 */
declare function attachScreenshot(data: string | Buffer, name?: string): string;
/**
 * Attach JSON data to the current test.
 */
declare function attachJson(data: unknown, name?: string): string;
/**
 * Attach plain text to the current test.
 */
declare function attachText(text: string, name?: string): string;
/**
 * Attach HTML content to the current test.
 */
declare function attachHtml(html: string, name?: string): string;
/**
 * Attach a video to the current test.
 */
declare function attachVideo(filePath: string, name?: string): string;

export { attachVideo as A, type StepResult as B, Severity as S, type TestRunResult as T, type TestResult as a, Status as b, Step as c, story as d, epic as e, feature as f, severity as g, link as h, issue as i, testcase as j, description as k, label as l, title as m, layer as n, owner as o, suite as p, subSuite as q, parentSuite as r, step as s, tag as t, attach as u, attachFile as v, attachScreenshot as w, attachJson as x, attachText as y, attachHtml as z };
