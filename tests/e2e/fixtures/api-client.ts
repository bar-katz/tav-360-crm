/**
 * API client helpers for E2E tests
 * Provides convenient methods for API interactions
 */
import { APIRequestContext } from '@playwright/test';
import { TEST_ENV } from '../config/test-env';
import { getAuthHeaders } from './auth';
import { getEntityEndpoint } from './entity-endpoints';

export class APIClient {
  constructor(private apiContext: APIRequestContext) {}

  /**
   * GET request with auth
   */
  async get<T = any>(endpoint: string): Promise<T> {
    const response = await this.apiContext.get(
      `${TEST_ENV.API_BASE_URL}${endpoint}`,
      { headers: getAuthHeaders() }
    );
    
    if (!response.ok()) {
      const errorText = await response.text();
      throw new Error(`GET ${endpoint} failed: ${response.status()} - ${errorText}`);
    }
    
    return response.json();
  }

  /**
   * POST request with auth
   */
  async post<T = any>(endpoint: string, data: any): Promise<T> {
    const response = await this.apiContext.post(
      `${TEST_ENV.API_BASE_URL}${endpoint}`,
      {
        data,
        headers: getAuthHeaders(),
      }
    );
    
    if (!response.ok()) {
      const errorText = await response.text();
      // Log the request data for debugging
      console.error(`POST ${endpoint} failed with status ${response.status()}`);
      console.error(`Request data:`, JSON.stringify(data, null, 2));
      console.error(`Error response:`, errorText);
      throw new Error(`POST ${endpoint} failed: ${response.status()} - ${errorText}`);
    }
    
    return response.json();
  }

  /**
   * PUT request with auth
   */
  async put<T = any>(endpoint: string, data: any): Promise<T> {
    const response = await this.apiContext.put(
      `${TEST_ENV.API_BASE_URL}${endpoint}`,
      {
        data,
        headers: getAuthHeaders(),
      }
    );
    
    if (!response.ok()) {
      const errorText = await response.text();
      throw new Error(`PUT ${endpoint} failed: ${response.status()} - ${errorText}`);
    }
    
    return response.json();
  }

  /**
   * DELETE request with auth
   */
  async delete(endpoint: string): Promise<void> {
    const response = await this.apiContext.delete(
      `${TEST_ENV.API_BASE_URL}${endpoint}`,
      { headers: getAuthHeaders() }
    );
    
    if (!response.ok()) {
      const errorText = await response.text();
      throw new Error(`DELETE ${endpoint} failed: ${response.status()} - ${errorText}`);
    }
  }

  /**
   * Upload file
   */
  async uploadFile(filePath: string, fileName: string): Promise<{ file_url: string; file_id: string }> {
    const fs = require('fs');
    const fileBuffer = fs.readFileSync(filePath);
    
    // Playwright API context handles multipart differently
    const response = await this.apiContext.post(
      `${TEST_ENV.API_BASE_URL}/upload`,
      {
        multipart: {
          file: {
            name: fileName,
            mimeType: this.getMimeType(fileName),
            buffer: fileBuffer,
          },
        },
        headers: {
          'Authorization': getAuthHeaders()['Authorization'],
          // Don't set Content-Type - Playwright sets it automatically for multipart
        },
      }
    );
    
    if (!response.ok()) {
      const errorText = await response.text();
      throw new Error(`File upload failed: ${response.status()} - ${errorText}`);
    }
    
    return response.json();
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  /**
   * List entities
   */
  async listEntities<T = any>(entityType: string, params?: { order_by?: string; limit?: number }): Promise<T[]> {
    const queryParams = new URLSearchParams();
    if (params?.order_by) {
      queryParams.append('order_by', params.order_by);
    }
    if (params?.limit) {
      queryParams.append('limit', String(params.limit));
    }
    
    const queryString = queryParams.toString();
    const endpointName = getEntityEndpoint(entityType);
    const endpoint = `/${endpointName}${queryString ? `?${queryString}` : ''}`;
    
    return this.get<T[]>(endpoint);
  }

  /**
   * Get entity by ID
   */
  async getEntity<T = any>(entityType: string, id: number): Promise<T> {
    const endpointName = getEntityEndpoint(entityType);
    return this.get<T>(`/${endpointName}/${id}`);
  }

  /**
   * Create entity
   */
  async createEntity<T = any>(entityType: string, data: any): Promise<T> {
    const endpointName = getEntityEndpoint(entityType);
    return this.post<T>(`/${endpointName}`, data);
  }

  /**
   * Update entity
   */
  async updateEntity<T = any>(entityType: string, id: number, data: any): Promise<T> {
    const endpointName = getEntityEndpoint(entityType);
    return this.put<T>(`/${endpointName}/${id}`, data);
  }

  /**
   * Delete entity
   */
  async deleteEntity(entityType: string, id: number): Promise<void> {
    const endpointName = getEntityEndpoint(entityType);
    return this.delete(`/${endpointName}/${id}`);
  }
}

/**
 * Create API client instance
 */
export function createAPIClient(apiContext: APIRequestContext): APIClient {
  return new APIClient(apiContext);
}

