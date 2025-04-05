const { db } = require('../db/connection');

exports.getLoggedInUserData = (req, res) => {
    const userId = req.user.userId; // Extract user ID from the token

    const query = `
        SELECT 
            user_id,
            username,
            email,
            created_at,
            updated_at
        FROM Users
        WHERE user_id = ?
    `;

    db.get(query, [userId], (err, row) => {
        if (err) {
            console.error('Error fetching user data:', err.message);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (!row) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(row); // Return user data
    });
};

// Fetch basic data of all registered users
exports.getAllUsers = (req, res) => {
    const query = `
        SELECT 
            user_id,
            username,
            email,
            created_at
        FROM Users
        ORDER BY created_at DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching users:', err.message);
            return res.status(500).json({ message: 'Internal server error' });
        }

        res.json(rows); // Return all users' basic data
    });
};