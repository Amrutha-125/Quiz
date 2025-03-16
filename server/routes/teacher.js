const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// Create a new quiz
router.post('/create-quiz', teacherController.createQuiz);

// View scores for a specific quiz
router.get('/scores/:quizId', teacherController.viewScores);

module.exports = router;