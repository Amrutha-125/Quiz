const db = require('../database');

module.exports = {
    getUserById: (id, callback) => {
        const query = 'SELECT * FROM users WHERE id = ?';
        db.query(query, [id], callback);
    },
    getUserByUsername: (username, callback) => {
        const query = 'SELECT * FROM users WHERE username = ?';
        db.query(query, [username], callback);
    },
    addUser: (user, callback) => {
        const query = 'INSERT INTO users SET ?';
        db.query(query, user, callback);
    }
};