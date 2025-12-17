import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "6888779dd9179a0ecd1d0d73", 
  requiresAuth: true // Ensure authentication is required for all operations
});
