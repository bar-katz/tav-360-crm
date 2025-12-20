/**
 * Centralized configuration module
 * Reads environment variables with proper defaults
 */

export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  },
  auth: {
    enabled: import.meta.env.VITE_AUTH_ENABLED !== 'false',
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'TAV 360 CRM',
  },
} as const;

export default config;

