const { db } = require('../db/connection');

exports.getAllTransactionCategories = (req, res) => {
    const query = `SELECT category_id, category_name FROM Transaction_Categories`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching transaction categories:', err.message);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.json(rows);
    });
};
