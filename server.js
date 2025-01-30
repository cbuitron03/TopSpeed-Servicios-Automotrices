const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Configurar base de datos PostgreSQL
const pool = new Pool({
    connectionString: 'postgresql://TopSpeedAdmin:TopSpeed2021@junction.proxy.rlwy.net:38155/railway'
});

pool.connect((err) => {
    if (err) {
        console.error('Error conectando a PostgreSQL:', err.message);
        return;
    }
    console.log('Conectado a PostgreSQL');
});

app.use(express.static('public'));
app.use(bodyParser.json());

// Endpoint para insertar datos
app.post('/submit', (req, res) => {
    const { cedula, name, email, phone, address, dob, gender, password, placa, marca, modelo, color, anio } = req.body;

    const duenioSql = `
        INSERT INTO "DUENIO" ("CEDULA", "NOMBRE", "EMAIL", "TELEFONO", "DIRECCION", "FECHA_NAC", "GENERO", "CONTRASENA") 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const vehiculoSql = `
        INSERT INTO "VEHICULO" ("PLACA", "CEDULA", "MARCA", "MODELO", "COLOR", "ANIO") 
        VALUES ($1, $2, $3, $4, $5, $6)
    `;

    pool.query(duenioSql, [cedula, name, email, phone, address, dob, gender, password], (err) => {
        if (err) {
            console.error('Error inserting into DUENIO table:', err.message);
            return res.status(500).send({ message: 'Error saving data' });
        }

        pool.query(vehiculoSql, [placa, cedula, marca, modelo, color, anio], (err) => {
            if (err) {
                console.error('Error inserting into VEHICULO table:', err.message);
                return res.status(500).send({ message: 'Error saving data' });
            }
            res.send({ message: 'Data saved successfully' });
        });
    });
});

// Endpoint para obtener vehículos
app.get('/vehiculo', (req, res) => {
    const query = 'SELECT * FROM "VEHICULO"';

    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener VEHICULO:', err);
            return res.status(500).send('Error al obtener VEHICULO');
        }
        res.json(results.rows); // Corregido para retornar un array directamente
    });
});

app.get('/duenio', (req, res) => {
    const query = 'SELECT * FROM "DUENIO"';

    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener DUENIO:', err);
            return res.status(500).send('Error al obtener DUENIO');
        }
        res.json(results.rows); // Corregido para retornar un array directamente
    });
});

// Endpoint para obtener productos
app.get('/productos', (req, res) => {
    const query = 'SELECT * FROM "PRODUCTO"';

    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error al consultar PRODUCTO:', err);
            return res.status(500).json({ error: 'Error al consultar PRODUCTO' });
        }

        res.json(results.rows); // Corregido para retornar un array directamente
    });
});

// Ruta para inicio de sesión
app.post('/login', (req, res) => {
    const { cedula, contrasena } = req.body;

    const queryCedula = 'SELECT "CONTRASENA" FROM "DUENIO" WHERE "CEDULA" = $1';

    pool.query(queryCedula, [cedula], (err, results) => {
        if (err) {
            console.error('Error al consultar DUENIO:', err);
            return res.status(500).send('Error interno del servidor');
        }

        if (results.rows.length === 0) {
            return res.status(401).send('Usuario no encontrado');
        }

        const contrasenaAlmacenada = results.rows[0].CONTRASENA.trim();

        if (contrasenaAlmacenada === contrasena) {
            res.status(200).send('Inicio de sesión exitoso');
        } else {
            res.status(401).send('Credenciales incorrectas');
        }
    });
});

// Endpoint para procesar pedidos
app.post('/procesar-pedido', (req, res) => {
    const { cedula, total, fechaPedido, fechaEntrega, productos } = req.body;

    if (!cedula || !total || !fechaPedido || !fechaEntrega || !productos || productos.length === 0) {
        return res.status(400).send({ error: 'Faltan datos requeridos para procesar el pedido.' });
    }

    // Insertar en la tabla PEDIDO
    const pedidoSql = `
        INSERT INTO "PEDIDO" ("CEDULA", "PED_PR_TOT", "PED_FECHA", "PED_FECH_ENT") 
        VALUES ($1, $2, $3, $4) RETURNING "PED_NUM"
    `;
    console.log('Ejecutando SQL:', pedidoSql);

    pool.query(pedidoSql, [cedula, parseFloat(total), fechaPedido, fechaEntrega], (err, pedidoResult) => {
        if (err) {
            console.error('Error al insertar en PEDIDO:', err.message);
            return res.status(500).send({ error: 'Error al procesar el pedido.' });
        }

        const lastInsertedPedNum = pedidoResult.rows[0].PED_NUM;
        console.log('Último número de pedido:', lastInsertedPedNum);

        let completed = 0;
        const totalProductos = productos.length;
        let errorOccurred = false;

        productos.forEach((producto) => {
            const { prd_id, cantidad, precio } = producto;

            const getProductIdQuery = 'SELECT "PRD_ID" FROM "PRODUCTO" WHERE "PRD_NOMBRE" = $1';
            console.log('Ejecutando SQL:', getProductIdQuery);

            pool.query(getProductIdQuery, [prd_id], (err, result) => {
                if (err || result.rows.length === 0) {
                    console.error(`Error al obtener ID para producto ${prd_id}:`, err || 'Producto no encontrado');
                    errorOccurred = true;
                } else {
                    const prd_codigo = result.rows[0].PRD_ID;
                    console.log(`ID del producto ${prd_id}:`, prd_codigo);

                    if (parseInt(prd_codigo, 10) < 4) {
                        // Insertar en PED_PRODUCTO
                        const pedidoProductoSql = `
                            INSERT INTO "PED_PRODUCTO" ("PRD_ID", "PED_NUM", "PED_CANT", "PED_PR") 
                            VALUES ($1, $2, $3, $4)
                        `;
                        console.log('Ejecutando SQL:', pedidoProductoSql);

                        pool.query(pedidoProductoSql, [prd_codigo, lastInsertedPedNum, cantidad, parseFloat(precio)], (err) => {
                            if (err) {
                                console.error('Error al insertar en PED_PRODUCTO:', err.message);
                                errorOccurred = true;
                            } else {
                                console.log(`Producto ${prd_id} insertado correctamente en PED_PRODUCTO.`);
                            }
                        });
                    } else {
                        // Insertar en CITA
                        const citaSql = `
                            INSERT INTO "CITA" ("CEDULA", "CITA_DESC", "CITA_FECHA", "CITA_ESTADO") 
                            VALUES ($1, $2, $3, $4)
                        `;
                        console.log('Ejecutando SQL:', citaSql);

                        pool.query(citaSql, [cedula, prd_id, fechaPedido, "agendar"], (err) => {
                            if (err) {
                                console.error('Error al insertar en CITA:', err.message);
                                errorOccurred = true;
                            } else {
                                console.log(`Cita para producto ${prd_id} creada correctamente.`);
                            }
                        });
                    }

                    // Actualizar inventario
                    const actualizarInventarioSql = `
                        UPDATE "PRODUCTO" 
                        SET "PRD_EXISTENCIA" = "PRD_EXISTENCIA" - $1 
                        WHERE "PRD_ID" = $2
                    `;
                    console.log('Ejecutando SQL:', actualizarInventarioSql);

                    pool.query(actualizarInventarioSql, [cantidad, prd_codigo], (err) => {
                        if (err) {
                            console.error('Error al actualizar el inventario:', err.message);
                            errorOccurred = true;
                        } else {
                            console.log(`Inventario actualizado para producto ${prd_id}.`);
                        }
                    });
                }

                completed++;
                if (completed === totalProductos) {
                    if (errorOccurred) {
                        return res.status(500).send({ error: 'Error al procesar algunos productos.' });
                    }

                    res.status(200).send({ message: 'Pedido procesado correctamente.' });
                }
            });
        });
    });
});

app.get('/get-cabeceras', (req, res) => {
    pool.query('SELECT * FROM "PEDIDO"', (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(200).send(results.rows);
    });
});

app.get('/get-cuerpo', (req, res) => {
    pool.query('SELECT * FROM "PED_PRODUCTO"', (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(200).send(results.rows);
    });
});

app.get('/get-cita', (req, res) => {
    pool.query('SELECT * FROM "CITA"', (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(200).send(results.rows);
    });
});

app.get('/get-stock', (req, res) => {
    pool.query('SELECT "PRD_ID", "PRD_DESC", "PRD_PRECIO", "PRD_EXISTENCIA", "PRD_NOMBRE" FROM "PRODUCTO"', (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(200).send(results.rows);
    });
});

// Ruta raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Servidor escuchando
app.listen(8080, () => {
    console.log('Servidor corriendo en http://localhost:8080');
});

module.exports = app;