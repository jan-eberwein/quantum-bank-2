const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../db/connection');
const { validationResult } = require('express-validator');
const { JWT_SECRET } = require('../utils/constants');

exports.signup = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    db.get('SELECT * FROM Users WHERE username = ? OR email = ?', [username, email], (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (user) return res.status(400).json({ message: 'Username or email already in use' });

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return res.status(500).json({ message: 'Error hashing password' });

            // Insert the new user
            db.run(
                'INSERT INTO Users (username, password_hash, email) VALUES (?, ?, ?)',
                [username, hashedPassword, email],
                function (err) {
                    if (err) return res.status(500).json({ message: 'Error creating user' });

                    const userId = this.lastID; // Retrieve the ID of the newly created user

                    // Create a new bank account for the user
                    db.run(
                        'INSERT INTO Accounts (owner_id, balance) VALUES (?, ?)',
                        [userId, 0], // Default balance is 0
                        (err) => {
                            if (err) return res.status(500).json({ message: 'Error creating account' });

                            // Respond with success message
                            res.status(201).json({ message: 'User and account created successfully' });
                        }
                    );
                }
            );
        });
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM Users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Error comparing passwords' });
            if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

            const token = jwt.sign({ userId: user.user_id }, JWT_SECRET, { expiresIn: '1y' });
            res.json({ message: 'Login successful', token });
        });
    });
};
