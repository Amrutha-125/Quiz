const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// View all available quizzes
router.get('/quizzes', studentController.viewQuizzes);

// Attempt a quiz
router.get('/quiz/:quizId', studentController.attemptQuiz);

// Submit a quiz
router.post('/submit-quiz', studentController.submitQuiz);

module.exports = router;