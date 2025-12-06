/**
 * Authentication Middleware
 * Provides session-based authentication checks for protected routes
 */

/**
 * Middleware to require user authentication
 * Redirects to /login if not authenticated
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }

  // For API requests, return 401
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // For page requests, redirect to login
  return res.redirect('/login');
}

/**
 * Middleware to require TA role
 * Must be used after requireAuth
 */
function requireTA(req, res, next) {
  if (req.session && req.session.user && req.session.user.isTa) {
    return next();
  }

  // For API requests, return 403
  if (req.path.startsWith('/api/')) {
    return res.status(403).json({ error: 'TA role required' });
  }

  // For page requests, redirect to home
  return res.redirect('/');
}

/**
 * Middleware to require admin role
 * Must be used after requireAuth
 */
function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.isAdmin) {
    return next();
  }

  // For API requests, return 403
  if (req.path.startsWith('/api/')) {
    return res.status(403).json({ error: 'Admin role required' });
  }

  // For page requests, redirect to home
  return res.redirect('/');
}

module.exports = {
  requireAuth,
  requireTA,
  requireAdmin
};
