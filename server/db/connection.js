const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.DB_USER || "your_username",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "your_database",
    password: process.env.DB_PASSWORD || "your_password",
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    max: 20, // Max number of connections in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 5000, // Return an error if connection is not established in 5 seconds
});

const connectWithRetry = async (retries = 5, delay = 3000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const client = await pool.connect();
            console.log("Database connected successfully.");
            client.release(); // Release client back to the pool
            break; // Exit the retry loop on success
        } catch (error) {
            console.error(`Database connection attempt ${attempt} failed:`, error.message);
            if (attempt === retries) {
                console.error("Max retries reached. Could not connect to the database.");
                process.exit(1); // Exit process if unable to connect
            }
            console.log(`Retrying in ${delay / 1000} seconds...`);
            await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
        }
    }
};

// Run the retry logic when initializing the app
connectWithRetry();

module.exports = {
    query: (text, params) => pool.query(text, params), // Wrapper for pool.query
    getClient: () => pool.connect(), // For manually acquiring a client
};
