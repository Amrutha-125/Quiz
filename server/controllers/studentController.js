const db = require('../database');

// View all available quizzes
exports.viewQuizzes = (req, res) => {
    const query = `
        SELECT * FROM quizzes 
        WHERE start_date <= NOW() AND end_date >= NOW()
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch quizzes' });
        }
        res.json(results);
    });
};

// Attempt a specific quiz
exports.attemptQuiz = (req, res) => {
    const quizId = req.params.quizId;

    const quizQuery = 'SELECT * FROM quizzes WHERE id = ?';
    const questionsQuery = 'SELECT * FROM questions WHERE quiz_id = ?';

    db.query(quizQuery, [quizId], (err, quizResults) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch quiz' });
        }

        if (quizResults.length === 0) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        db.query(questionsQuery, [quizId], (err, questionResults) => {
            if (err) {
                console.error('Database Error:', err);
                return res.status(500).json({ success: false, message: 'Failed to fetch questions' });
            }

            res.json({ 
                success: true, 
                quiz: quizResults[0], 
                questions: questionResults 
            });
        });
    });
};


// Submit a quiz
exports.submitQuiz = (req, res) => {
    const { quizId, answers, studentId } = req.body;

    // Validate required fields
    if (!quizId || !answers || !studentId) {
        return res.status(400).json({ success: false, message: 'Quiz ID, answers, and student ID are required' });
    }

    let score = 0;
    const query = 'SELECT correct_option FROM questions WHERE quiz_id = ?';
    db.query(query, [quizId], (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch correct answers' });
        }

        // Calculate the score
        results.forEach((question, index) => {
            if (question.correct_option === answers[index]) {
                score++;
            }
        });

        // Insert the score into the database
        const insertQuery = 'INSERT INTO scores (quiz_id, student_id, score, answers) VALUES (?, ?, ?, ?)';
        db.query(insertQuery, [quizId, studentId, score, JSON.stringify(answers)], (err) => {
            if (err) {
                console.error('Database Error:', err);
                return res.status(500).json({ success: false, message: 'Failed to save quiz results' });
            }
            res.json({ success: true, score });
        });
    });
};