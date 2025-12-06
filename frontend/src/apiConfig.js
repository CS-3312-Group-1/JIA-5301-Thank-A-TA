// frontend/src/apiConfig.js

/**
 * The base URL for the API.
 * All API routes are prefixed with /api and served from the same domain.
 * In development with proxy, requests go to the backend via the proxy.
 * In production, requests go directly to /api on the same server.
 */
export const API_BASE_URL = '/api';

/**
 * The base URL for the frontend application.
 * Used for constructing absolute URLs for sharing or redirection.
 */
export const FRONTEND_BASE_URL = process.env.REACT_APP_FRONTEND_BASE_URL || (
  process.env.NODE_ENV === 'production'
    ? 'https://thankta.cc.gatech.edu'
    : 'http://localhost:3000'
);
