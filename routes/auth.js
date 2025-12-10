/**
 * Authentication Routes - CAS SSO ONLY
 */

const express = require('express');
const router = express.Router();

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
