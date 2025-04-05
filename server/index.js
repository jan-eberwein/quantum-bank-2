const express = require('express');
const cors = require('cors'); // Import CORS middleware
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
const corsOptions = {
    origin: 'http://localhost:3000', // Allow requests from localhost:3000
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};

app.use(cors(corsOptions)); // Use CORS middleware with options

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
