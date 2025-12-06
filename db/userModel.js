const pool = require('./connection');
const bcrypt = require('bcrypt');

// CAS-only: Create user from CAS authentication
async function createUserFromCAS(email, name, isTa = false, isAdmin = false) {
  const [result] = await pool.execute(
    'INSERT INTO users (email, password, name, isTa, isAdmin) VALUES (?, NULL, ?, ?, ?)',
    [email, name, isTa, isAdmin]
  );
  return result.insertId;
}

async function findUserByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

// Update user TA status (when they become a TA)
async function updateUserTaStatus(email, isTa) {
  const [result] = await pool.execute(
    'UPDATE users SET isTa = ? WHERE email = ?',
    [isTa, email]
  );
  return result.affectedRows > 0;
}

// DEPRECATED: Old password-based functions (kept for migration)
async function createUser(email, password, name, isTa, isAdmin) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.execute(
    'INSERT INTO users (email, password, name, isTa, isAdmin) VALUES (?, ?, ?, ?, ?)',
    [email, hashedPassword, name, isTa, isAdmin]
  );
  return result.insertId;
}

module.exports = {
  createUserFromCAS,
  findUserByEmail,
  updateUserTaStatus,
  // Deprecated - for migration only
  createUser,
};
