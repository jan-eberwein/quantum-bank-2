const { db } = require('../db/connection');

exports.getAccountsByUser = (req, res) => {
    const userId = req.user.userId; // Extract user ID from the token

    const query = `
        SELECT 
            account_id,
            balance
        FROM Accounts
        WHERE owner_id = ?
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching accounts:', err.message);
            return res.status(500).json({ message: 'Internal server error' });
        }

        res.json(rows); // Return all accounts for the authenticated user
    });
};
