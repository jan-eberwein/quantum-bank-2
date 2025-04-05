const express = require('express');
const { getAllTransactionStatuses } = require('../controllers/transactionStatusController');

const router = express.Router();

// Endpoint to get all transaction categories
router.get('/', getAllTransactionStatuses);

module.exports = router;
