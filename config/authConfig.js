import { isDatabaseConfigured } from './db.js';

export const getTokenKey = () => {
  return process.env.TOKEN_KEY || null;
};

export const getAuthMode = () => {
  return isDatabaseConfigured() ? 'database' : 'unconfigured';
};
