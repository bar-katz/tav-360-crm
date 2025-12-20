/**
 * CRM Automation functions
 */
import { apiClient } from '../apiClient';

/**
 * Generate and alert matches between properties and clients
 */
export async function GenerateAndAlertMatches(params: any = {}): Promise<any> {
  return apiClient.post('/automation/generate-matches', params);
}

