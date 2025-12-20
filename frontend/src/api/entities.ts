/**
 * Entity exports - replaces Base44 SDK entities
 * This file maintains backward compatibility with existing imports
 */
export * from './entities/index';

// Re-export User for auth
export { User } from './entities/index';

