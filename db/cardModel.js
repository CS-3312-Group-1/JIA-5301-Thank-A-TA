const pool = require('./connection');

async function save(card) {
    const [result] = await pool.execute(
        'INSERT INTO cards (data, contentType, forEmail, fromName, fromClass, fromSemester) VALUES (?, ?, ?, ?, ?, ?)',
        [card.data, card.contentType, card.forEmail, card.fromName, card.fromClass, card.fromSemester]
    );
    return result;
}

async function find(query) {
    const lookupEmail = query.forEmail || query.for;
    if (!lookupEmail) {
        throw new Error('Card lookup requires a forEmail value.');
    }
    const [rows] = await pool.execute(
        'SELECT id, data, contentType, forEmail, fromName, fromClass, fromSemester, createdAt FROM cards WHERE forEmail = ? ORDER BY createdAt ASC',
        [lookupEmail]
    );
    return rows;
}

module.exports = {
    save,
    find,
};
