const bodyParser = require('body-parser');
const path = require('path');
const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();

// Configurar base de datos MySQL
const db = mysql.createConnection({
    host: 'autorack.proxy.rlwy.net', // Dirección interna de Railway
    user: 'TopSpeed',                  // Usuario
    password: 'TopSpeed2021',  // Contraseña
    database: 'railway',      // Nombre de la base de datos
    port: 50900                  // Puerto
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a MySQL');
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
        INSERT INTO vehiculo (placa, cedula, marca, modelo, color, anio) 
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
app.listen(8080, () => {
    console.log('Servidor corriendo en http://localhost:8080');
});

// Ruta raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
