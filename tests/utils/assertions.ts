/**
 * Custom assertion utilities
 */
import { expect } from '@playwright/test';

/**
 * Assert database record exists
 */
export async function assertRecordExists(
  queryResult: any[],
  condition: (record: any) => boolean,
  errorMessage?: string
): Promise<void> {
  const record = queryResult.find(condition);
  expect(record, errorMessage || 'Record should exist').toBeDefined();
}

/**
 * Assert database record does not exist
 */
export async function assertRecordNotExists(
  queryResult: any[],
  condition: (record: any) => boolean,
  errorMessage?: string
): Promise<void> {
  const record = queryResult.find(condition);
  expect(record, errorMessage || 'Record should not exist').toBeUndefined();
}

/**
 * Assert financial precision (no rounding errors)
 */
export function assertFinancialPrecision(
  actual: number,
  expected: number,
  decimals: number = 2
): void {
  expect(actual.toFixed(decimals)).toBe(expected.toFixed(decimals));
}

/**
 * Assert date range validity
 */
export function assertDateRange(
  startDate: Date | string,
  endDate: Date | string
): void {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  expect(end.getTime()).toBeGreaterThan(start.getTime());
}

