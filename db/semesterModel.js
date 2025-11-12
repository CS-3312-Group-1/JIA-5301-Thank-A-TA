const pool = require('./connection');

async function find(query = {}) {
  let sql = 'SELECT * FROM semesters';
  const params = [];
  if (Object.keys(query).length > 0) {
    sql += ' WHERE ';
    const whereClauses = [];
    for (const key in query) {
      whereClauses.push(`${key} = ?`);
      params.push(query[key]);
    }
    sql += whereClauses.join(' AND ');
  }
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function findOneAndUpdate(filter, update, options) {
  const { upsert, new: returnNew } = options;
  const [rows] = await pool.execute('SELECT * FROM semesters WHERE semester = ?', [filter.semester]);
  let result;
  if (rows.length > 0) {
    // Update
    const [updateResult] = await pool.execute('UPDATE semesters SET fileRef = ?, isEnabled = ? WHERE semester = ?', [update.fileRef, update.isEnabled, filter.semester]);
    result = { ...rows[0], ...update };
  } else if (upsert) {
    // Insert
    const [insertResult] = await pool.execute('INSERT INTO semesters (semester, fileRef, isEnabled) VALUES (?, ?, ?)', [filter.semester, update.fileRef, update.isEnabled]);
    result = { id: insertResult.insertId, ...filter, ...update };
  }
  if (returnNew) {
    return result;
  }
  return rows[0];
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM semesters WHERE id = ?', [id]);
  return rows[0];
}

async function findByIdAndDelete(id) {
  const [result] = await pool.execute('DELETE FROM semesters WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function updateOne(filter, update) {
    const [result] = await pool.execute('UPDATE semesters SET isEnabled = ? WHERE id = ?', [update.$set.isEnabled, filter._id]);
    return result.affectedRows > 0;
}


module.exports = {
  find,
  findOneAndUpdate,
  findById,
  findByIdAndDelete,
  updateOne,
};