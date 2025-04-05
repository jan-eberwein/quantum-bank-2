const express = require('express');
const { getLoggedInUserData, getAllUsers } = require('../controllers/userController');

const router = express.Router();

// Endpoint to get logged-in user data
router.get('/me', getLoggedInUserData);
// Endpoint to get basic data of all registered users
router.get('/', getAllUsers);

module.exports = router;
