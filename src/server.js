const express = require('express');
const cors = require('cors');
const db = require('./db.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app= express();
app.use(cors());
app.use(express.json());

const Port = process.env.PORT || '(PUT THE PORT)';

app.get('/', (req, res) => {
    res.send('Hello from server!');
});

app.get('/login', (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM users WHERE id = ?`;
    
    db.get(sql, [id], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Error when searching for user', error: err.message });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    });
});

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.run(sql, [name, email, password], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Error in user criation', error: err.message });
        }
        res.status(201).json({
            message: 'User created successfully',
            userId: this.lastID, name, email, password
        });
    });
});

app.put('/profile', (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const sql = 'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?';
    db.run(sql, [name, email, password, id], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Error in user update', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: 'User updated successfully',
            userId: id, name, email, password
        });
    });
});

app.delete('/api/delete/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM users WHERE id = ?';
    db.run(sql, [id], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Error in user deletion', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: 'User deleted successfully',
            userId: id
        });
    });
});


//JWT Authentication
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

//Login Endpoint

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.get(sql, [email], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'The Email is not registered', error: err.message });
        }
        if (!user || user.password !== password) {
            
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ token });
    });
});

//Middleware to protect routes
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.sendStatus(403);
    }
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};


app.post('/logout', (req, res) => {
    res.status(200).json({ message: 'Logout successful. Remove the token on the client side.' });
  });

app.get('/protected', authenticateJWT, (req, res) => {
    res.status(200).json({ message: 'This is a protected route', user: req.user });
});
app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
});


