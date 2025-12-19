/**
 * Decorators for annotating tests with metadata.
 * Compatible with Allure-style annotations.
 */

import { Severity, parseSeverity } from './severity';

// Metadata storage key
const QAGENTIC_METADATA = Symbol('qagentic_metadata');

/**
 * Test metadata structure.
 */
export interface TestMetadata {
  labels: Record<string, unknown>;
  links: Array<{ url: string; name: string; type: string }>;
  attachments: unknown[];
}

/**
 * Get or create metadata for a test.
 */
function getMetadata(target: unknown): TestMetadata {
  const obj = target as Record<symbol, TestMetadata>;
  if (!obj[QAGENTIC_METADATA]) {
    obj[QAGENTIC_METADATA] = {
      labels: {},
      links: [],
      attachments: [],
    };
  }
  return obj[QAGENTIC_METADATA];
}

/**
 * Add a label to test metadata.
 */
function addLabel(name: string, value: unknown) {
  return function <T extends object>(target: T): T {
    const metadata = getMetadata(target);
    metadata.labels[name] = value;
    return target;
  };
}

/**
 * Mark test with a feature label.
 */
export function feature(name: string) {
  return addLabel('feature', name);
}

/**
 * Mark test with a user story label.
 */
export function story(name: string) {
  return addLabel('story', name);
}

/**
 * Mark test with an epic label.
 */
export function epic(name: string) {
  return addLabel('epic', name);
}

/**
 * Mark test with a severity level.
 */
export function severity(level: Severity | string) {
  const sev = typeof level === 'string' ? parseSeverity(level) : level;
  return addLabel('severity', sev);
}

/**
 * Add tags to a test.
 */
export function tag(...tags: string[]) {
  return function <T extends object>(target: T): T {
    const metadata = getMetadata(target);
    const existingTags = (metadata.labels['tags'] as string[]) || [];
    metadata.labels['tags'] = [...existingTags, ...tags];
    return target;
  };
}

/**
 * Add a custom label to a test.
 */
export function label(name: string, value: string) {
  return addLabel(name, value);
}

/**
 * Add a link to a test.
 */
export function link(url: string, name?: string, type: string = 'link') {
  return function <T extends object>(target: T): T {
    const metadata = getMetadata(target);
    metadata.links.push({
      url,
      name: name || url,
      type,
    });
    return target;
  };
}

/**
 * Link test to an issue tracker.
 */
export function issue(url: string, name?: string) {
  return link(url, name, 'issue');
}

/**
 * Link test to a test management system.
 */
export function testcase(url: string, name?: string) {
  return link(url, name, 'tms');
}

/**
 * Add a description to a test.
 */
export function description(text: string) {
  return addLabel('description', text);
}

/**
 * Set a custom title for the test.
 */
export function title(name: string) {
  return addLabel('title', name);
}

/**
 * Set the test owner.
 */
export function owner(name: string) {
  return addLabel('owner', name);
}

/**
 * Set the test layer.
 */
export function layer(name: string) {
  return addLabel('layer', name);
}

/**
 * Set the suite name.
 */
export function suite(name: string) {
  return addLabel('suite', name);
}

/**
 * Set the sub-suite name.
 */
export function subSuite(name: string) {
  return addLabel('subSuite', name);
}

/**
 * Set the parent suite name.
 */
export function parentSuite(name: string) {
  return addLabel('parentSuite', name);
}

/**
 * Get all metadata for a test.
 */
export function getTestMetadata(target: unknown): TestMetadata {
  return getMetadata(target);
}
