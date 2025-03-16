
const db = require('../database');

// Create a new quiz
exports.createQuiz = (req, res) => {
    const { title, startDate, endDate, questions } = req.body;
    const createdBy = req.session.userId; // Get the teacher's ID from the session

    // Validate input
    if (!title || !startDate || !endDate || !questions || questions.length === 0) {
        return res.status(400).json({ success: false, message: 'All fields are required, and at least one question must be provided' });
    }

    // Log the questions for debugging
    console.log('Questions:', questions);

    // Insert the quiz into the database
    const quizQuery = 'INSERT INTO quizzes (title, start_date, end_date, created_by) VALUES (?, ?, ?, ?)';
    db.query(quizQuery, [title, startDate, endDate, createdBy], (err, result) => {
        if (err) {
            console.error('Database Error (Quiz):', err);
            return res.status(500).json({ success: false, message: 'Failed to create quiz' });
        }

        const quizId = result.insertId; // Get the ID of the newly created quiz

        // Insert questions into the database
        const questionPromises = questions.map((question, index) => {
            return new Promise((resolve, reject) => {
                // Validate question fields
                if (!question.text || !question.type || !question.correctOption) {
                    reject(`Question ${index + 1} is missing required fields`);
                    return;
                }

                // Validate correctOption for MCQ questions
                if (question.type === 'MCQ' && !['A', 'B', 'C', 'D'].includes(question.correctOption)) {
                    reject(`Question ${index + 1}: correctOption must be one of A, B, C, or D`);
                    return;
                }

                // Prepare question data
                const questionData = [
                    quizId,
                    question.text,
                    question.type,
                    question.optionA || null,
                    question.optionB || null,
                    question.optionC || null,
                    question.optionD || null,
                    question.correctOption
                ];

                // Insert the question
                const questionQuery = `
                    INSERT INTO questions 
                    (quiz_id, question_text, question_type, option_a, option_b, option_c, option_d, correct_option) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;
                db.query(questionQuery, questionData, (err) => {
                    if (err) {
                        console.error('Database Error (Question):', err);
                        reject(`Failed to insert question ${index + 1}: ${err.message}`);
                    } else {
                        resolve();
                    }
                });
            });
        });

        // Wait for all questions to be inserted
        Promise.all(questionPromises)
            .then(() => {
                res.json({ success: true, message: 'Quiz and questions created successfully', quizId });
            })
            .catch((error) => {
                console.error('Error inserting questions:', error);

                // Rollback: Delete the quiz if any question insertion fails
                const deleteQuizQuery = 'DELETE FROM quizzes WHERE id = ?';
                db.query(deleteQuizQuery, [quizId], (err) => {
                    if (err) {
                        console.error('Failed to rollback quiz:', err);
                    }
                    res.status(500).json({ success: false, message: 'Some questions could not be saved. Quiz creation rolled back.', error });
                });
            });
    });
};
// View all quizzes created by the teacher
exports.viewQuizzes = (req, res) => {
    const createdBy = req.session.userId; // Get the teacher's ID from the session

    const query = 'SELECT * FROM quizzes WHERE created_by = ?';
    db.query(query, [createdBy], (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch quizzes' });
        }
        res.json(results);
    });
};

// View scores for a specific quiz
exports.viewScores = (req, res) => {
    const quizId = req.params.quizId;

    const query = `
        SELECT users.username, scores.score 
        FROM scores 
        JOIN users ON scores.student_id = users.id 
        WHERE scores.quiz_id = ?
    `;
    db.query(query, [quizId], (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch scores' });
        }
        res.json(results);
    });
};