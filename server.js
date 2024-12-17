const bodyParser = require('body-parser');
const path = require('path');
const express = require('express');
const mysql = require('mysql');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar base de datos MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a MySQL');
    // Creación de las tablas si no existen
    const duenioTable = `
        CREATE TABLE IF NOT EXISTS duenio (
            id INT AUTO_INCREMENT PRIMARY KEY, 
            cedula VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(255) NOT NULL,
            address VARCHAR(255) NOT NULL,
            dob DATE NOT NULL,
            gender VARCHAR(50) NOT NULL,
            password VARCHAR(255) NOT NULL
        )
    `;
    const vehiculoTable = `
        CREATE TABLE IF NOT EXISTS vehiculo (
            id INT AUTO_INCREMENT PRIMARY KEY, 
            placa VARCHAR(255) NOT NULL,
            marca VARCHAR(255) NOT NULL,
            modelo VARCHAR(255) NOT NULL,
            color VARCHAR(255) NOT NULL,
            anio VARCHAR(4) NOT NULL,
            cedula VARCHAR(255) NOT NULL
        )
    `;
    db.query(duenioTable, (err) => {
        if (err) console.error('Error creating duenio table:', err.message);
    });
    db.query(vehiculoTable, (err) => {
        if (err) console.error('Error creating vehiculo table:', err.message);
    });
});

app.use(express.static('public'));
app.use(bodyParser.json());

// Conexión a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        return;
    }
    console.log('Connected to the MySQL database.');

    
});

// Endpoint para insertar datos
app.post('/submit', (req, res) => {
    const { cedula, name, email, phone, address, dob, gender, password, placa, marca, modelo, color, anio } = req.body;

    // Insertar datos en la tabla `duenio`
    const duenioSql = `
        INSERT INTO duenio (cedula, name, email, phone, address, dob, gender, password) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const vehiculoSql = `
        INSERT INTO vehiculo (placa, marca, modelo, color, anio, cedula) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(duenioSql, [cedula, name, email, phone, address, dob, gender, password], (err) => {
        if (err) {
            console.error('Error inserting into duenio table:', err.message);
            return res.status(500).send({ message: 'Error saving data' });
        }
        // Insertar datos en la tabla `vehiculo`
        db.query(vehiculoSql, [placa, marca, modelo, color, anio, cedula], (err) => {
            if (err) {
                console.error('Error inserting into vehiculo table:', err.message);
                return res.status(500).send({ message: 'Error saving data' });
            }
            res.send({ message: 'Data saved successfully' });
        });
    });
});

// Servidor escuchando
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Ruta raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
