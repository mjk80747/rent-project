import { isDatabaseConfigured } from './db.js';
import { isDemoAuthEnabled } from './demoAuth.js';

export const getTokenKey = () => {
  if (process.env.TOKEN_KEY) {
    return process.env.TOKEN_KEY;
  }

  if (isDemoAuthEnabled()) {
    return 'rent-project-vercel-demo-token';
  }

  return null;
};

export const getAuthMode = () => {
  if (isDatabaseConfigured()) {
    return 'database';
  }

  if (isDemoAuthEnabled()) {
    return 'demo';
  }

  return 'unconfigured';
};
