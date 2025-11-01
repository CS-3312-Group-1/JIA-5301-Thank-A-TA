const pool = require('./connection');

async function findTaByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM tas WHERE email = ?', [email]);
  return rows[0];
}

async function findOne(query) {
    const [rows] = await pool.execute('SELECT * FROM tas WHERE email = ?', [query.email]);
    return rows[0];
}

async function find(query = {}) {
    if (!query.semester) {
        throw new Error('TA.find requires a semester property.');
    }
    const [rows] = await pool.execute('SELECT * FROM tas WHERE semester = ?', [query.semester]);
    return rows;
}

async function save(ta) {
    const [result] = await pool.execute('INSERT INTO tas (name, email, class, semester, ref) VALUES (?, ?, ?, ?, ?)', [ta.name, ta.email, ta.class, ta.semester, ta.ref]);
    return result;
}

async function findByIdAndUpdate(id, ta) {
    const [result] = await pool.execute('UPDATE tas SET name = ?, email = ?, class = ? WHERE id = ?', [ta.name, ta.email, ta.class, id]);
    return result.affectedRows > 0;
}

async function deleteOne(query) {
    const [result] = await pool.execute('DELETE FROM tas WHERE id = ?', [query._id]);
    return result.affectedRows > 0;
}

async function deleteMany(filter) {
  const [result] = await pool.execute('DELETE FROM tas WHERE semester = ?', [filter.semester]);
  return result.affectedRows;
}

async function insertMany(tas) {
  const sql = 'INSERT INTO tas (name, email, class, semester, ref) VALUES ?';
  const values = tas.map(ta => [ta.name, ta.email, ta.class, ta.semester, ta.ref]);
  const [result] = await pool.query(sql, [values]);
  return result;
}

async function findById(id) {
    const [rows] = await pool.execute('SELECT * FROM tas WHERE id = ?', [id]);
    return rows[0];
}

async function findBySemesters(semesters) {
    if (!Array.isArray(semesters) || semesters.length === 0) {
        return [];
    }
    const [rows] = await pool.query('SELECT * FROM tas WHERE semester IN (?)', [semesters]);
    return rows;
}

module.exports = {
  findTaByEmail,
  deleteMany,
  insertMany,
  findOne,
  find,
  save,
  findByIdAndUpdate,
  deleteOne,
  findById,
  findBySemesters,
};
