const db = require('../database');

module.exports = {
    addQuestion: (question, callback) => {
        const query = 'INSERT INTO questions SET ?';
        db.query(query, question, callback);
    },
    getQuestionsByQuiz: (quizId, callback) => {
        const query = 'SELECT * FROM questions WHERE quiz_id = ?';
        db.query(query, [quizId], callback);
    }
};