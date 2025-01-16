const bodyParser = require('body-parser');
const fs = require('fs');
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
        INSERT INTO DUENIO (CEDULA, NOMBRE, EMAIL, TELEFONO, DIRECCION, FECHA_NAC, GENERO, CONTRASENA) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const vehiculoSql = `
        INSERT INTO VEHICULO (PLACA, CEDULA, MARCA, MODELO, COLOR, ANIO) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(duenioSql, [cedula, name, email, phone, address, dob, gender, password], (err) => {
        if (err) {
            console.error('Error inserting into duenio table:', err.message);
            return res.status(500).send({ message: 'Error saving data' });
        }
        // Insertar datos en la tabla `vehiculo`
        db.query(vehiculoSql, [placa, cedula, marca, modelo, color, anio], (err) => {
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

app.get('/vehiculo', (req, res) => {
    // Ajusta el nombre de la tabla si es "VEHICULO" o "productos"
    const query = 'SELECT * FROM VEHICULO';

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error al obtener productos:', err);
        return res.status(500).send('Error al obtener productos');
      }
      res.json(results); // Devuelve la lista de productos
    });
  });

// Endpoint para obtener los datos y exportarlos
app.get('/productos', (req, res) => {
    const query = 'SELECT * FROM PRODUCTO';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al consultar los datos:', err);
            return res.status(500).json({ error: 'Error al consultar los datos' });
        }

        // Transformar los registros al formato deseado
        const transformedData = results.map((producto) => {
            const imagenesAdicionales = producto.imagen_adicionales ? producto.imagen_adicionales.split(',') : [null, null, null];

            return [
                producto.PRD_ID, // ID del producto
                producto.PRD_NOMBRE || '', // Nombre del producto
                producto.PRD_PRECIO || 0.00, // Precio del producto
                producto.PRD_EXISTENCIA || 0, // Stock del producto
                producto.PRD_DESC || '', // Descripción del producto
                producto.PRD_I_P || '', // Imagen principal
                producto.PRD_ANC || 0, // Ancho de la imagen
                producto.PRD_ALT || 0, // Alto de la imagen
                producto.PRD_T_M || '', // Título del producto
                producto.PRD_D_M || '', // Descripción adicional
                producto.PRD_I_S ? producto.PRD_I_S.split(',') : [], // Imágenes adicionales
                producto.PRD_ALT1 || '' // Otra descripción o título
            ];
        });

        // Usar path.join para generar la ruta correcta dentro de 'public'
        const jsonFilePath = path.join(__dirname, 'public', 'productos.json');

        // Guardar los datos transformados en un archivo JSON
        fs.writeFileSync(jsonFilePath, JSON.stringify(transformedData, null, 2));

        // Enviar respuesta al cliente
        res.json({
            message: 'Datos exportados correctamente',
            file: jsonFilePath,
            data: transformedData,
        });
    });
});

// Ruta para inicio de sesión
app.post('/login', (req, res) => {
    const { cedula , contrasena }= req.body;

    // Verificar si la cédula existe en la tabla
    const queryCedula = 'SELECT CONTRASENA FROM DUENIO WHERE CEDULA = ?';
    db.query(queryCedula, [cedula], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).send('Error interno del servidor');
        }

        console.log(results); // Para depuración

        if (results.length === 0) {
            // La cédula no existe
            return res.status(401).send('Usuario no encontrado');
        }

        const contrasenaAlmacenada = results[0].CONTRASENA; // Mayúsculas para el campo

        // Comparar contraseñas
        if (contrasenaAlmacenada.trim() === contrasena) { // Usar trim() para evitar problemas de espacios
            return res.status(200).send('Inicio de sesión exitoso');
        } else {
            return res.status(401).send('Credenciales incorrectas');
        }
    });
});

app.post('/procesar-pedido', (req, res) => {
    const { cedula, total, fechaPedido, fechaEntrega, productos } = req.body;

    // Validar datos básicos antes de procesar
    if (!cedula || !total || !fechaPedido || !fechaEntrega || !productos || productos.length === 0) {
        return res.status(400).send({ error: 'Faltan datos requeridos para procesar el pedido.' });
    }

    // Query para insertar en la tabla PEDIDO
    const pedidoSql = `
        INSERT INTO PEDIDO (CEDULA, PED_PR_TOT, PED_FECHA, PED_FECH_ENT) 
        VALUES (?, ?, ?, ?)
    `;
    console.log('SQL Query PEDIDO:', pedidoSql, [cedula, parseFloat(total), fechaPedido, fechaEntrega]);

    db.query(pedidoSql, [cedula, parseFloat(total), fechaPedido, fechaEntrega], (err) => {
        if (err) {
            console.error('Error inserting into PEDIDO table:', err.message);
            return res.status(500).send({ error: 'Error al procesar el pedido.' });
        }

        // Obtener el último PED_NUM insertado
        db.query('SELECT LAST_INSERT_ID() AS lastInsertedPedNum', (err, lastInsertResult) => {
            if (err) {
                console.error('Error getting last insert ID:', err.message);
                return res.status(500).send({ error: 'Error al obtener el último pedido.' });
            }

            const lastInsertedPedNum = lastInsertResult[0].lastInsertedPedNum;

            // Procesar cada producto en la lista
            let completed = 0; // Contador de operaciones completadas
            const totalProductos = productos.length;
            let errorOccurred = false; // Flag para controlar errores

            productos.forEach((producto) => {
                const { prd_id, cantidad, precio } = producto;

                if (!prd_id || !cantidad || !precio) {
                    console.error('Producto con datos faltantes:', producto);
                    errorOccurred = true; // Establecer el error
                    return res.status(400).send({ error: 'Datos incompletos en la lista de productos.' });
                }

                // Query para insertar en PEDIDO_PRODUCTO
                const pedidoProductoSql = `
                    INSERT INTO PED_PRODUCTO (PRD_ID, PED_NUM, PED_CANT, PED_PR) 
                    VALUES (?, ?, ?, ?)
                `;
                console.log('SQL Query PED_PRODUCTO:', pedidoProductoSql, [prd_id, lastInsertedPedNum, cantidad, parseFloat(precio)]);

                db.query(pedidoProductoSql, [prd_id, lastInsertedPedNum, cantidad, parseFloat(precio)], (err) => {
                    if (err) {
                        console.error('Error inserting into PED_PRODUCTO table:', err.message);
                        errorOccurred = true;
                        return res.status(500).send({ error: 'Error al procesar el pedido.' });
                    }

                    // Query para actualizar el inventario
                    const actualizarInventarioSql = `
                        UPDATE PRODUCTO 
                        SET PRD_EXISTENCIA = PRD_EXISTENCIA - ? 
                        WHERE PRD_ID = ?
                    `;
                    console.log('SQL Query UPDATE PRODUCTO:', actualizarInventarioSql, [cantidad, prd_id]);

                    db.query(actualizarInventarioSql, [cantidad, prd_id], (err) => {
                        if (err) {
                            console.error('Error updating PRODUCTO table:', err.message);
                            errorOccurred = true;
                            return res.status(500).send({ error: 'Error al procesar el pedido.' });
                        }

                        // Incrementar contador y verificar si todas las operaciones terminaron
                        completed++;
                        if (completed === totalProductos && !errorOccurred) {
                            res.status(200).send({ message: 'Pedido procesado exitosamente.' });
                        }
                    });
                });
            });
        });
    });
});
