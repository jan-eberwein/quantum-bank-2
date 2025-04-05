const { db } = require('../db/connection');

exports.getAllTransactionStatuses = (req, res) => {
    const query = `SELECT status_id, status_name FROM Transaction_Statuses`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching transaction statuses:', err.message);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.json(rows);
    });
};
