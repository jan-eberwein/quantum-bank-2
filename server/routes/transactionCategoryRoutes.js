const express = require('express');
const { getAllTransactionCategories } = require('../controllers/transactionCategoryController');

const router = express.Router();

// Endpoint to get all transaction categories
router.get('/', getAllTransactionCategories);

module.exports = router;
