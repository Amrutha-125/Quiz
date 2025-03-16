const db = require('../database');

module.exports = {
    addScore: (score, callback) => {
        const query = 'INSERT INTO scores SET ?';
        db.query(query, score, callback);
    },
    getScoresByQuiz: (quizId, callback) => {
        const query = 'SELECT * FROM scores WHERE quiz_id = ?';
        db.query(query, [quizId], callback);
    }
};