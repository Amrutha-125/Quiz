const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// View all users
router.get('/users', adminController.viewUsers);

// Add a new user
router.post('/add-user', adminController.addUser);

module.exports = router;