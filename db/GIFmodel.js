const pool = require('./connection');

async function save(gif) {
    const [result] = await pool.execute(
        'INSERT INTO gifs (name, imageData, contentType, size, uploadedBy) VALUES (?, ?, ?, ?, ?)',
        [gif.name, gif.data, gif.contentType, gif.size, gif.uploadedBy]
    );
    return result;
}

async function find() {
    const [rows] = await pool.execute('SELECT id, name, size, uploadedBy FROM gifs');
    return rows;
}

async function findById(id) {
    const [rows] = await pool.execute('SELECT id, name, imageData, contentType, size, uploadedBy FROM gifs WHERE id = ?', [id]);
    if (!rows[0]) {
        return undefined;
    }
    const gif = rows[0];
    return {
        id: gif.id,
        name: gif.name,
        data: gif.imageData,
        contentType: gif.contentType || 'image/gif',
        size: gif.size,
        uploadedBy: gif.uploadedBy,
    };
}

async function findByIdAndDelete(id) {
    const [result] = await pool.execute('DELETE FROM gifs WHERE id = ?', [id]);
    return result.affectedRows > 0;
}

module.exports = {
    save,
    find,
    findById,
    findByIdAndDelete,
};
