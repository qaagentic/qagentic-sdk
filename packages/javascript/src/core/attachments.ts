/**
 * Attachment utilities for adding files, screenshots, and data to test reports.
 */

import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentStep } from './step';
import type { Attachment } from './types';

// Global attachment storage for current test
let testAttachments: Attachment[] = [];

/**
 * Get current test attachments.
 */
export function getAttachments(): Attachment[] {
  return testAttachments;
}

/**
 * Clear attachments for new test.
 */
export function clearAttachments(): void {
  testAttachments = [];
}

/**
 * Attach data to the current test or step.
 */
export function attach(
  data: string | Buffer,
  name: string,
  type: string = 'text/plain',
  extension?: string
): string {
  const attachmentId = uuidv4();

  let content: string;
  let size: number;

  if (Buffer.isBuffer(data)) {
    content = data.toString('base64');
    size = data.length;
  } else {
    content = data;
    size = data.length;
  }

  const attachment: Attachment = {
    id: attachmentId,
    name,
    type,
    extension,
    content,
    size,
    timestamp: new Date().toISOString(),
  };

  // Add to current step if in step context
  const currentStep = getCurrentStep();
  if (currentStep) {
    currentStep.attachments.push(attachment);
  } else {
    // Add to test-level attachments
    testAttachments.push(attachment);
  }

  return attachmentId;
}

/**
 * Attach a file to the current test.
 */
export function attachFile(filePath: string, name?: string): string {
  const resolvedPath = path.resolve(filePath);
  const displayName = name || path.basename(filePath);

  if (!fs.existsSync(resolvedPath)) {
    // If file doesn't exist, attach the path as text
    return attach(filePath, displayName, 'text/plain');
  }

  const content = fs.readFileSync(resolvedPath);
  const ext = path.extname(filePath).slice(1);
  const mimeType = getMimeType(ext);

  return attach(content, displayName, mimeType, ext);
}

/**
 * Attach a screenshot to the current test.
 */
export function attachScreenshot(
  data: string | Buffer,
  name: string = 'Screenshot'
): string {
  if (typeof data === 'string' && fs.existsSync(data)) {
    const content = fs.readFileSync(data);
    return attach(content, name, 'image/png', 'png');
  }
  return attach(data, name, 'image/png', 'png');
}

/**
 * Attach JSON data to the current test.
 */
export function attachJson(
  data: unknown,
  name: string = 'JSON Data'
): string {
  const jsonStr = JSON.stringify(data, null, 2);
  return attach(jsonStr, name, 'application/json', 'json');
}

/**
 * Attach plain text to the current test.
 */
export function attachText(text: string, name: string = 'Text'): string {
  return attach(text, name, 'text/plain', 'txt');
}

/**
 * Attach HTML content to the current test.
 */
export function attachHtml(html: string, name: string = 'HTML'): string {
  return attach(html, name, 'text/html', 'html');
}

/**
 * Attach a video to the current test.
 */
export function attachVideo(filePath: string, name: string = 'Video'): string {
  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    return attach(filePath, name, 'video/mp4', 'mp4');
  }

  const content = fs.readFileSync(resolvedPath);
  const ext = path.extname(filePath).slice(1);
  const mimeType = ext === 'webm' ? 'video/webm' : 'video/mp4';

  return attach(content, name, mimeType, ext);
}

/**
 * Get MIME type from file extension.
 */
function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    json: 'application/json',
    xml: 'application/xml',
    html: 'text/html',
    txt: 'text/plain',
    csv: 'text/csv',
    mp4: 'video/mp4',
    webm: 'video/webm',
    log: 'text/plain',
  };

  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
}
