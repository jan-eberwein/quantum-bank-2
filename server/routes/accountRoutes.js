const express = require('express');
const { getAccountsByUser } = require('../controllers/accountController');

const router = express.Router();

// Endpoint to get all bank accounts belonging to the logged-in user
router.get('/me', getAccountsByUser);

module.exports = router;
