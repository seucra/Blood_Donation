require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS for production
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(bodyParser.json());

// MySQL connection with environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'lakshya',
    database: process.env.DB_NAME || 'blood_donation',
    ssl: process.env.NODE_ENV === 'production' ? {rejectUnauthorized: true} : false
});

// ...existing code for db.connect...

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// ...existing code for signup and login routes...

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
