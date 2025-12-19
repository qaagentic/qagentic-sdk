/**
 * Step context manager for defining test steps.
 */

import { v4 as uuidv4 } from 'uuid';
import { Status } from './status';
import type { StepResult, Attachment } from './types';

// Current step stack (thread-local equivalent for Node.js)
let currentSteps: Step[] = [];

/**
 * Get the current step stack.
 */
export function getCurrentSteps(): Step[] {
  return currentSteps;
}

/**
 * Get the current active step.
 */
export function getCurrentStep(): Step | undefined {
  return currentSteps[currentSteps.length - 1];
}

/**
 * Clear the step stack.
 */
export function clearSteps(): void {
  currentSteps = [];
}

/**
 * Represents a test step with timing and status tracking.
 */
export class Step {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  status: Status = Status.PENDING;
  startTime?: Date;
  endTime?: Date;
  durationMs: number = 0;
  error?: string;
  errorTrace?: string;
  attachments: Attachment[] = [];
  children: Step[] = [];
  parameters: Record<string, unknown> = {};

  constructor(name: string, description?: string, parameters?: Record<string, unknown>) {
    this.id = uuidv4();
    this.name = name;
    this.description = description;
    this.parameters = parameters || {};
  }

  /**
   * Start the step.
   */
  start(): this {
    this.startTime = new Date();
    this.status = Status.RUNNING;
    currentSteps.push(this);
    return this;
  }

  /**
   * End the step.
   */
  end(error?: Error): this {
    this.endTime = new Date();
    if (this.startTime) {
      this.durationMs = this.endTime.getTime() - this.startTime.getTime();
    }

    // Remove from stack
    const index = currentSteps.indexOf(this);
    if (index > -1) {
      currentSteps.splice(index, 1);
    }

    // Add to parent if exists
    const parent = getCurrentStep();
    if (parent) {
      parent.children.push(this);
    }

    if (error) {
      this.status = Status.FAILED;
      this.error = error.message;
      this.errorTrace = error.stack;
    } else {
      this.status = Status.PASSED;
    }

    return this;
  }

  /**
   * Attach data to this step.
   */
  attach(data: string | Buffer, name: string, type: string = 'text/plain'): this {
    const content = typeof data === 'string' ? data : data.toString('base64');
    this.attachments.push({
      id: uuidv4(),
      name,
      type,
      content,
      size: typeof data === 'string' ? data.length : data.length,
      timestamp: new Date().toISOString(),
    });
    return this;
  }

  /**
   * Attach a screenshot.
   */
  attachScreenshot(path: string, name: string = 'Screenshot'): this {
    return this.attach(path, name, 'image/png');
  }

  /**
   * Attach JSON data.
   */
  attachJson(data: unknown, name: string = 'JSON Data'): this {
    return this.attach(JSON.stringify(data, null, 2), name, 'application/json');
  }

  /**
   * Set a step parameter.
   */
  setParameter(name: string, value: unknown): this {
    this.parameters[name] = value;
    return this;
  }

  /**
   * Convert to result object.
   */
  toResult(): StepResult {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      startTime: this.startTime,
      endTime: this.endTime,
      durationMs: this.durationMs,
      error: this.error,
      errorTrace: this.errorTrace,
      attachments: this.attachments,
      children: this.children.map((c) => c.toResult()),
      parameters: this.parameters,
    };
  }
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
export function step<T>(name: string, fn: () => T): T;
export function step<T>(name: string, description: string, fn: () => T): T;
export function step<T>(
  name: string,
  descriptionOrFn: string | (() => T),
  fn?: () => T
): T {
  const description = typeof descriptionOrFn === 'string' ? descriptionOrFn : undefined;
  const callback = typeof descriptionOrFn === 'function' ? descriptionOrFn : fn!;

  const s = new Step(name, description);
  s.start();

  try {
    const result = callback();

    // Handle promises
    if (result instanceof Promise) {
      return result
        .then((value) => {
          s.end();
          return value;
        })
        .catch((error) => {
          s.end(error);
          throw error;
        }) as T;
    }

    s.end();
    return result;
  } catch (error) {
    s.end(error as Error);
    throw error;
  }
}

/**
 * Create a step without executing (for manual control).
 */
export function createStep(name: string, description?: string): Step {
  return new Step(name, description);
}
