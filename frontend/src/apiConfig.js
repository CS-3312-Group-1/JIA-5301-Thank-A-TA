// frontend/src/apiConfig.js

/**
 * The base URL for the API.
 * In production, this will be an empty string, and requests will be made to the same domain.
 * In development, this will be http://localhost:3001.
 */
export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? ''
  : 'http://localhost:3001';

/**
 * The base URL for the frontend application.
 * Used for constructing absolute URLs for sharing or redirection.
 */
export const FRONTEND_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://thankta.cc.gatech.edu'
  : 'http://localhost:3000';
