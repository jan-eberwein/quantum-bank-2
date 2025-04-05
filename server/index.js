const express = require('express');
const cors = require('cors'); // Import the cors package
const { db } = require('./db/connection');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const transactionCategoryRoutes = require('./routes/transactionCategoryRoutes');
const transactionStatusesRoutes = require('./routes/transactionStatusesRoutes');
const accountRoutes = require('./routes/accountRoutes');
const userRoutes = require('./routes/userRoutes');
const { authenticateToken } = require('./middlewares/authMiddleware');

const app = express();
const port = 3001;

// Middleware
app.use(express.json()); // Built-in Express method to parse JSON

// CORS Configuration
app.use(
    cors({
        origin: 'http://localhost:3000', // Allow requests from the frontend
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
        credentials: true, // Allow cookies and credentials
    })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', authenticateToken, transactionRoutes);
app.use('/api/transaction-categories', authenticateToken, transactionCategoryRoutes);
app.use('/api/transaction-statuses', authenticateToken, transactionStatusesRoutes);
app.use('/api/accounts', authenticateToken, accountRoutes);
app.use('/api/users', authenticateToken, userRoutes);

// Health Check Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API!' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing the database connection:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});


/*const express = require('express');
const { db } = require('./db/connection');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const transactionCategoryRoutes = require('./routes/transactionCategoryRoutes');
const transactionStatusesRoutes = require('./routes/transactionStatusesRoutes');
const accountRoutes = require('./routes/accountRoutes');
const userRoutes = require('./routes/userRoutes');
const { authenticateToken } = require('./middlewares/authMiddleware');

const app = express();
const port = 3001;

// Middleware
app.use(express.json()); // Built-in Express method to parse JSON

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', authenticateToken, transactionRoutes);
app.use('/api/transaction-categories', authenticateToken, transactionCategoryRoutes);
app.use('/api/transaction-statuses', authenticateToken, transactionStatusesRoutes);
app.use('/api/accounts', authenticateToken, accountRoutes);
app.use('/api/users', authenticateToken, userRoutes);

// Health Check Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API!' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing the database connection:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});
*/