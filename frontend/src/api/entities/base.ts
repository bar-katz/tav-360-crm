/**
 * Base Entity class - provides CRUD operations for all entities
 * Uses PostgREST query syntax for filtering, pagination, joins, etc.
 */
import { apiClient } from '../apiClient';

export interface ListOptions {
  select?: string[];  // For joins: ['*', 'contact(*)']
  order?: string;      // PostgREST format: 'created_date.desc' or 'name.asc'
  limit?: number;
  offset?: number;
}

export interface FilterOptions {
  [key: string]: any;  // PostgREST filter operators: { category: 'eq.מגורים', price: 'lte.2000000' }
}

export class BaseEntity {
  protected static entityName: string;

  /**
   * List entities with PostgREST query syntax
   * @param filters - PostgREST filter operators (e.g., { category: 'eq.מגורים' })
   * @param options - List options including select (joins), order, limit, offset
   */
  static async list<T = any>(filters?: FilterOptions, options?: ListOptions): Promise<T[]> {
    const params = new URLSearchParams();
    
    // Add filters (PostgREST syntax)
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        // If value is already in PostgREST format (e.g., 'eq.מגורים'), use as-is
        // Otherwise, wrap it in eq operator
        if (typeof value === 'string' && (value.includes('.') || value.startsWith('('))) {
          params.append(key, value);
        } else {
          params.append(key, `eq.${value}`);
        }
      });
    }
    
    // Add select (joins)
    if (options?.select && options.select.length > 0) {
      params.append('select', options.select.join(','));
    }
    
    // Add ordering (PostgREST format: field.desc or field.asc)
    if (options?.order) {
      // Convert old format (-created_date) to PostgREST format (created_date.desc)
      let orderParam = options.order;
      if (orderParam.startsWith('-')) {
        orderParam = `${orderParam.substring(1)}.desc`;
      } else if (!orderParam.includes('.')) {
        orderParam = `${orderParam}.asc`;
      }
      params.append('order', orderParam);
    }
    
    // Add pagination
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    if (options?.offset) {
      params.append('offset', options.offset.toString());
    }
    
    const queryString = params.toString();
    const endpoint = `/${this.entityName}${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<T[]>(endpoint);
  }
  
  /**
   * Legacy list method for backward compatibility
   * Converts old format to new PostgREST format
   */
  static async listLegacy<T = any>(orderBy?: string, limit?: number): Promise<T[]> {
    const options: ListOptions = {};
    if (orderBy) options.order = orderBy;
    if (limit) options.limit = limit;
    return this.list<T>(undefined, options);
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
  
  /**
   * Call a PostgreSQL function via PostgREST RPC endpoint
   * @param functionName - Name of the PostgreSQL function
   * @param params - Parameters to pass to the function
   */
  static async rpc<T = any>(functionName: string, params?: Record<string, any>): Promise<T> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
    }
    const queryString = queryParams.toString();
    return apiClient.get<T>(`/rpc/${functionName}${queryString ? `?${queryString}` : ''}`);
  }
  
  /**
   * Call a PostgreSQL function via POST (for complex parameters)
   */
  static async rpcPost<T = any>(functionName: string, params?: Record<string, any>): Promise<T> {
    return apiClient.post<T>(`/rpc/${functionName}`, params || {});
  }
}

