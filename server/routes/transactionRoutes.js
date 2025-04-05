const express = require('express');
const {
    getTransactionsBySender,
    getTransactionsByReceiver,
    getTransactionsByInvolvement,
    createTransaction
} = require('../controllers/transactionController');
const router = express.Router();

// Route to get transactions where the logged-in user's account was the sender
router.get('/sender/:accountId', getTransactionsBySender);

// Route to get transactions where the logged-in user's account was the receiver
router.get('/receiver/:accountId', getTransactionsByReceiver);

// Route to get transactions where the logged-in user's account was involved (either as sender or receiver)
router.get('/involved/:accountId', getTransactionsByInvolvement);


// Create a new transaction
router.post('/', createTransaction);

module.exports = router;
