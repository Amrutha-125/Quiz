const db = require('../database');

module.exports = {
    createQuiz: (quiz, callback) => {
        const query = 'INSERT INTO quizzes SET ?';
        db.query(query, quiz, callback);
    },
    getQuizzesByTeacher: (teacherId, callback) => {
        const query = 'SELECT * FROM quizzes WHERE created_by = ?';
        db.query(query, [teacherId], callback);
    },
    getAvailableQuizzes: (callback) => {
        const query = 'SELECT * FROM quizzes WHERE start_date <= NOW() AND end_date >= NOW()';
        db.query(query, callback);
    }
};