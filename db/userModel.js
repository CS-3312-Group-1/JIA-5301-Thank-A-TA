const pool = require('./connection');
const bcrypt = require('bcrypt');

async function createUser(email, password, name, isTa, isAdmin) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.execute(
    'INSERT INTO users (email, password, name, isTa, isAdmin) VALUES (?, ?, ?, ?, ?)',
    [email, hashedPassword, name, isTa, isAdmin]
  );
  return result.insertId;
}

async function findUserByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

module.exports = {
  createUser,
  findUserByEmail,
};
