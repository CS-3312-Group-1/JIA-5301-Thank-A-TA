/**
 * Authentication Routes - CAS SSO ONLY
 * Email/password authentication is disabled in favor of CAS SSO
 */

const express = require('express');
const router = express.Router();

/**
 * POST /login - DISABLED (CAS-only)
 * Redirect to CAS login instead
 */
router.post('/login', async (req, res) => {
  res.status(403).json({
    error: 'Email/password login is disabled. Please use CAS SSO.',
    redirectUrl: '/cas-login'
  });
});

/**
 * POST /register - DISABLED (CAS-only)
 * Redirect to CAS login instead
 */
router.post('/register', async (req, res) => {
  res.status(403).json({
    error: 'Email/password registration is disabled. Please use CAS SSO.',
    redirectUrl: '/cas-login'
  });
});

/**
 * POST /logout
 * Destroy session and redirect to CAS logout
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('ta_session');
    res.status(200).json({
      message: 'Logout successful',
      redirectUrl: 'https://login.gatech.edu/cas/logout'
    });
  });
});

/**
 * GET /api/session
 * Return current session data for client-side auth checks
 */
router.get('/api/session', (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).json({
      authenticated: true,
      user: req.session.user
    });
  }

  res.status(200).json({
    authenticated: false,
    user: null
  });
});

module.exports = router;
