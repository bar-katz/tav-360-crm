/**
 * Base Entity class - provides CRUD operations for all entities
 * Replaces Base44 SDK entity methods
 */
import { apiClient } from '../apiClient';

export interface ListOptions {
  orderBy?: string;
  limit?: number;
}

export class BaseEntity {
  protected static entityName: string;

  /**
   * List entities with optional ordering and limit
   * @param orderBy - Field to order by (prefix with - for descending, e.g., "-created_date")
   * @param limit - Maximum number of results
   */
  static async list<T = any>(orderBy?: string, limit?: number): Promise<T[]> {
    const params = new URLSearchParams();
    if (orderBy) params.append('order_by', orderBy);
    if (limit) params.append('limit', limit.toString());

    const queryString = params.toString();
    const endpoint = `/${this.entityName}${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<T[]>(endpoint);
  }

  /**
   * Get entity by ID
   */
  static async get<T = any>(id: string | number): Promise<T> {
    return apiClient.get<T>(`/${this.entityName}/${id}`);
  }

  /**
   * Create new entity
   */
  static async create<T = any>(data: Record<string, any>): Promise<T> {
    return apiClient.post<T>(`/${this.entityName}`, data);
  }

  /**
   * Update entity
   */
  static async update<T = any>(id: string | number, data: Record<string, any>): Promise<T> {
    return apiClient.put<T>(`/${this.entityName}/${id}`, data);
  }

  /**
   * Delete entity
   */
  static async delete(id: string | number): Promise<void> {
    return apiClient.delete(`/${this.entityName}/${id}`);
  }
}

