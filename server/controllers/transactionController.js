const { db } = require('../db/connection');

// Function to get transactions for a specific account as the sender
exports.getTransactionsBySender = (req, res) => {
    const userId = req.user.userId;
    const accountId = parseInt(req.params.accountId, 10);

    if (isNaN(accountId)) {
        return res.status(400).json({ message: 'Invalid account ID' });
    }

    // Check if the account belongs to the logged-in user
    db.get('SELECT account_id FROM Accounts WHERE owner_id = ? AND account_id = ?', [userId, accountId], (err, account) => {
        if (err) {
            console.error('Error fetching user account:', err.message);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (!account) {
            return res.status(404).json({ message: 'Account not found or does not belong to the user' });
        }

        const query = `
            SELECT 
                t.transaction_id,
                t.sender_account_id,
                t.recipient_account_id,
                t.amount,
                t.description,
                t.transaction_date,
                tc.category_name,
                ts.status_name
            FROM Transactions t
            LEFT JOIN Transaction_Categories tc ON t.category_id = tc.category_id
            LEFT JOIN Transaction_Statuses ts ON t.status_id = ts.status_id
            WHERE t.sender_account_id = ?
            ORDER BY t.transaction_date DESC
        `;

        db.all(query, [accountId], (err, rows) => {
            if (err) {
                console.error('Error fetching transactions:', err.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            res.json(rows);
        });
    });
};

// Function to get transactions for a specific account as the receiver
exports.getTransactionsByReceiver = (req, res) => {
    const userId = req.user.userId;
    const accountId = parseInt(req.params.accountId, 10);

    if (isNaN(accountId)) {
        return res.status(400).json({ message: 'Invalid account ID' });
    }

    // Check if the account belongs to the logged-in user
    db.get('SELECT account_id FROM Accounts WHERE owner_id = ? AND account_id = ?', [userId, accountId], (err, account) => {
        if (err) {
            console.error('Error fetching user account:', err.message);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (!account) {
            return res.status(404).json({ message: 'Account not found or does not belong to the user' });
        }

        const query = `
            SELECT 
                t.transaction_id,
                t.sender_account_id,
                t.recipient_account_id,
                t.amount,
                t.description,
                t.transaction_date,
                tc.category_name,
                ts.status_name
            FROM Transactions t
            LEFT JOIN Transaction_Categories tc ON t.category_id = tc.category_id
            LEFT JOIN Transaction_Statuses ts ON t.status_id = ts.status_id
            WHERE t.recipient_account_id = ?
            ORDER BY t.transaction_date DESC
        `;

        db.all(query, [accountId], (err, rows) => {
            if (err) {
                console.error('Error fetching transactions:', err.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            res.json(rows);
        });
    });
};

// Function to get transactions where the logged-in user's account was involved (either as sender or receiver)
exports.getTransactionsByInvolvement = (req, res) => {
    const userId = req.user.userId;
    const accountId = parseInt(req.params.accountId, 10);

    if (isNaN(accountId)) {
        return res.status(400).json({ message: 'Invalid account ID' });
    }

    // Check if the account belongs to the logged-in user
    db.get('SELECT account_id FROM Accounts WHERE owner_id = ? AND account_id = ?', [userId, accountId], (err, account) => {
        if (err) {
            console.error('Error fetching user account:', err.message);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (!account) {
            return res.status(404).json({ message: 'Account not found or does not belong to the user' });
        }

        const query = `
            SELECT 
                t.transaction_id,
                t.sender_account_id,
                t.recipient_account_id,
                t.amount,
                t.description,
                t.transaction_date,
                tc.category_name,
                ts.status_name
            FROM Transactions t
            LEFT JOIN Transaction_Categories tc ON t.category_id = tc.category_id
            LEFT JOIN Transaction_Statuses ts ON t.status_id = ts.status_id
            WHERE t.sender_account_id = ? OR t.recipient_account_id = ?
            ORDER BY t.transaction_date DESC
        `;

        db.all(query, [accountId, accountId], (err, rows) => {
            if (err) {
                console.error('Error fetching transactions:', err.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            res.json(rows);
        });
    });
};

exports.createTransaction = (req, res) => {
    const { senderId, recipientId, amount, categoryId, statusId, description } = req.body;

    if (!senderId || !recipientId || amount === undefined || amount === null || !statusId || !description) {
        return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (senderId === recipientId) {
        return res.status(400).json({ message: 'Sender and recipient cannot be the same account' });
    }

    if (amount <= 0) {
        return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    // Step 1: Validate transaction details
    validateTransaction(senderId, recipientId, amount, req, (err, senderAccount, recipientAccount) => {
        if (err) {
            console.error('Transaction validation failed:', err.message);
            return res.status(400).json({ message: err.message });
        }

        // Step 2: Insert transaction
        insertTransaction(senderId, recipientId, amount, categoryId, statusId, description, (err, transactionId) => {
            if (err) {
                console.error('Error inserting transaction:', err.message);
                return res.status(500).json({ message: 'Error creating transaction' });
            }

            // Step 3: Update account balances
            updateBalances(senderId, recipientId, amount, (err) => {
                if (err) {
                    console.error('Error updating account balances:', err.message);
                    return res.status(500).json({ message: 'Error processing transaction' });
                }

                res.status(201).json({ message: 'Transaction created successfully', transaction_id: transactionId });
            });
        });
    });
};


const validateTransaction = (senderId, recipientId, amount, req, callback) => {
    const query = `
        SELECT account_id, balance, owner_id 
        FROM Accounts 
        WHERE account_id IN (?, ?)
    `;

    db.all(query, [senderId, recipientId], (err, accounts) => {
        if (err) return callback(err);

        if (!accounts || accounts.length !== 2) {
            return callback(new Error('One or both accounts do not exist'));
        }

        const senderAccount = accounts.find(acc => acc.account_id === senderId);
        const recipientAccount = accounts.find(acc => acc.account_id === recipientId);

        if (!senderAccount) return callback(new Error('Sender account not found'));
        if (!recipientAccount) return callback(new Error('Recipient account not found'));
        if (senderAccount.balance < amount) return callback(new Error('Insufficient balance'));

        // Verify that the sender account belongs to the logged-in user
        if (senderAccount.owner_id !== req.user.userId) {
            return callback(new Error('Sender account does not belong to the logged-in user'));
        }

        callback(null, senderAccount, recipientAccount);
    });
};

const insertTransaction = (senderId, recipientId, amount, categoryId, statusId, description, callback) => {
    const query = `
        INSERT INTO Transactions (
            sender_account_id, 
            recipient_account_id, 
            amount, 
            status_id, 
            category_id, 
            description
        ) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [senderId, recipientId, amount, statusId, categoryId, description], function (err) {
        if (err) return callback(err);
        callback(null, this.lastID); // `this.lastID` provides the ID of the inserted transaction
    });
};

const updateBalances = (senderId, recipientId, amount, callback) => {
    const updateSenderQuery = `
        UPDATE Accounts 
        SET balance = balance - ? 
        WHERE account_id = ?
    `;
    const updateRecipientQuery = `
        UPDATE Accounts 
        SET balance = balance + ? 
        WHERE account_id = ?
    `;

    db.run(updateSenderQuery, [amount, senderId], (err) => {
        if (err) return callback(err);

        db.run(updateRecipientQuery, [amount, recipientId], (err) => {
            if (err) return callback(err);
            callback(null);
        });
    });
};