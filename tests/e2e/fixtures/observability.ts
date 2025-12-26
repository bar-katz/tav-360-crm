/**
 * Observability and logging utilities
 * Structured logging, screenshots, metrics
 */
import { Page, APIResponse } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface TestLogEntry {
  test_id: string;
  timestamp: string;
  step: string;
  action?: string;
  duration_ms?: number;
  db_queries?: number;
  api_calls?: number;
  error?: string;
}

const testLogs: TestLogEntry[] = [];
let currentTestId: string = '';

/**
 * Initialize logging for a test
 */
export function initTestLog(testId: string): void {
  currentTestId = testId;
  testLogs.length = 0; // Clear previous logs
}

/**
 * Log a test step
 */
export function logStep(
  step: string,
  action?: string,
  durationMs?: number,
  metadata?: { db_queries?: number; api_calls?: number }
): void {
  const entry: TestLogEntry = {
    test_id: currentTestId,
    timestamp: new Date().toISOString(),
    step,
    action,
    duration_ms: durationMs,
    ...metadata,
  };
  
  testLogs.push(entry);
  console.log(`[${entry.timestamp}] ${currentTestId} - ${step}${action ? ` - ${action}` : ''}${durationMs ? ` (${durationMs}ms)` : ''}`);
}

/**
 * Log an error
 */
export function logError(error: Error | string, step?: string): void {
  const entry: TestLogEntry = {
    test_id: currentTestId,
    timestamp: new Date().toISOString(),
    step: step || 'error',
    error: error instanceof Error ? error.message : error,
  };
  
  testLogs.push(entry);
  console.error(`[${entry.timestamp}] ${currentTestId} - ERROR: ${entry.error}`);
}

/**
 * Capture screenshot on failure
 */
export async function captureScreenshotOnFailure(
  page: Page,
  testName: string
): Promise<void> {
  const screenshotDir = path.join(__dirname, '../../test-results/screenshots');
  
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${testName}_${timestamp}.png`;
  const filepath = path.join(screenshotDir, filename);
  
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot saved: ${filepath}`);
}

/**
 * Log network request/response
 */
export function logNetworkRequest(
  url: string,
  method: string,
  status: number,
  durationMs: number
): void {
  logStep('network_request', `${method} ${url}`, durationMs, {
    api_calls: 1,
  });
  
  if (status >= 400) {
    logError(`HTTP ${status} for ${method} ${url}`, 'network_error');
  }
}

/**
 * Capture database state snapshot
 */
export async function captureDbSnapshot(
  dbClient: any,
  tableNames: string[],
  testName: string
): Promise<void> {
  const snapshotDir = path.join(__dirname, '../../test-results/db-snapshots');
  
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshot: Record<string, any[]> = {};
  
  for (const tableName of tableNames) {
    try {
      const result = await dbClient.query(`SELECT * FROM ${tableName} LIMIT 100`);
      snapshot[tableName] = result.rows;
    } catch (error) {
      snapshot[tableName] = { error: String(error) };
    }
  }
  
  const filename = `${testName}_${timestamp}.json`;
  const filepath = path.join(snapshotDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2));
  console.log(`💾 DB snapshot saved: ${filepath}`);
}

/**
 * Get test execution metrics
 */
export function getTestMetrics(): {
  total_steps: number;
  total_duration_ms: number;
  api_calls: number;
  db_queries: number;
  errors: number;
} {
  const metrics = {
    total_steps: testLogs.length,
    total_duration_ms: testLogs.reduce((sum, log) => sum + (log.duration_ms || 0), 0),
    api_calls: testLogs.reduce((sum, log) => sum + (log.api_calls || 0), 0),
    db_queries: testLogs.reduce((sum, log) => sum + (log.db_queries || 0), 0),
    errors: testLogs.filter(log => log.error).length,
  };
  
  return metrics;
}

/**
 * Save test logs to file
 */
export function saveTestLogs(testName: string): void {
  const logsDir = path.join(__dirname, '../../test-results/logs');
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${testName}_${timestamp}.json`;
  const filepath = path.join(logsDir, filename);
  
  const output = {
    test_id: currentTestId,
    test_name: testName,
    logs: testLogs,
    metrics: getTestMetrics(),
  };
  
  fs.writeFileSync(filepath, JSON.stringify(output, null, 2));
  console.log(`📝 Test logs saved: ${filepath}`);
}

/**
 * Measure execution time of async function
 */
export async function measureTime<T>(
  fn: () => Promise<T>,
  stepName: string
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    logStep(stepName, undefined, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logStep(stepName, undefined, duration);
    logError(error as Error, stepName);
    throw error;
  }
}

