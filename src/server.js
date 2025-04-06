const express = require('express');
const cors = require('cors');
const db = require('./db.js');
require('dotenv').config();

const app= express();
app.use(cors());
app.use(express.json());

const Port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Hello from server!');
});

app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM users WHERE id = ?`;
    
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao buscar o usuário', error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.status(200).json(row);
    });
});

app.post('/api/post', (req, res) => {
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

app.put('/api/update/:id', (req, res) => {
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
        // If the user was updated successfully, return the updated user data
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
        // If the user was deleted successfully, return a success message
        res.status(200).json({
            message: 'User deleted successfully',
            userId: id
        });
    });
});






app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
});