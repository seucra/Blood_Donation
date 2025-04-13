const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'lakshya',  // Your MySQL password
    database: 'blood_donation'
});

db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Signup route
app.post('/api/signup', async (req, res) => {
    const {
        first_name, last_name, email, password, gender, age, blood_type,
        contact_number, address, city, state, zip_code
    } = req.body;

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO donors (
        first_name, last_name, email, password, gender, age, blood_type, 
        contact_number, address, city, state, zip_code
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [
        first_name, last_name, email, hashedPassword, gender, age, blood_type,
        contact_number, address, city, state, zip_code
    ], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.status(201).json({ success: true, message: 'Signup successful' });
    });
});

// Login route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const sql = `SELECT * FROM donors WHERE email = ? LIMIT 1`;
    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect password' });
        }

        res.json({ success: true, message: 'Login successful' });
    });
});

// Handle all routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
