const express = require('express');
const bodyParser = require('body-parser');
const { message } = require('statuses');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 5000;

app.use(express.static('public'));
app.use(bodyParser.json());

const db = new sqlite3.Database('./TopSpeed.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS duenio (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        cedula TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        dob DATE NOT NULL,
        gender TEXT NOT NULL,
        password TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS vehiculo (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        placa TEXT NOT NULL,
        marca TEXT NOT NULL,
        modelo TEXT NOT NULL,
        color TEXT NOT NULL,
        anio TEXT NOT NULL,
        cedula DATE NOT NULL
    )`);
});

app.post('/submit', (req, res) => {
    const { cedula, name, email, phone, address, dob, gender, password, placa, marca, modelo, color, anio } = req.body;
    const sql = `INSERT INTO duenio (cedula, name, email, phone, address, dob, gender, password) VALUES (?,?,?,?,?,?,?,?)`;
    const sql2 = `INSERT INTO vehiculo (placa, marca, modelo, color, anio, cedula) VALUES (?,?,?,?,?,?)`;
    db.run(sql, [cedula, name, email, phone, address, dob, gender, password], (err) => {
        if (err){
            return console.error(err.message);
        }
        res.send({ message: 'Data saved successfully'});
    });
    db.run(sql2, [placa, marca, modelo, color, anio, cedula], (err) => {
        if (err){
            return console.error(err.message);
        }
        res.send({ message: 'Data saved successfully'});
    })
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});