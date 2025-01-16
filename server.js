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

app.post('/login', (req, res) => {
    const { cedula, contrasena } = req.body;

    // Verificar si la cédula existe en la tabla
    const queryCedula = 'SELECT CONTRASENA FROM DUENIO WHERE CEDULA = ?';
    db.query(queryCedula, [cedula], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).send('Error interno del servidor');
        }

        console.log("Resultados de la consulta:", results);

        if (results.length === 0) {
            return res.status(401).send('Usuario no encontrado');
        }

        const contrasenaAlmacenada = results[0].CONTRASENA.trim();

        if (contrasenaAlmacenada === contrasena) {
            return res.status(200).send('Inicio de sesión exitoso');
        } else {
            return res.status(401).send('Credenciales incorrectas');
        }
    });
});


app.post('/procesar-pedido', async (req, res) => {
    const { cedula, total, fechaPedido, fechaEntrega, productos } = req.body;

    try {
        // 1. Insertar en la tabla PEDIDO
        const [pedidoResult] = await db.query(
            `INSERT INTO PEDIDO (CEDULA, PED_PR_TOT, PED_FECHA, PED_FECH_ENT) 
             VALUES (?, ?, ?, ?)`,
            [cedula, total, fechaPedido, fechaEntrega]
        );

        const pedNum = pedidoResult.insertId; // Obtener el número de pedido generado

        // 2. Insertar en la tabla PEDIDO_PRODUCTO y actualizar inventario
        for (const producto of productos) {
            const { prd_id, cantidad, precio } = producto;

            // Insertar en PEDIDO_PRODUCTO
            await db.query(
                `INSERT INTO PEDIDO_PRODUCTO (PRD_ID, PED_NUM, PED_CANT, PED_PR) 
                 VALUES (?, ?, ?, ?)`,
                [prd_id, pedNum, cantidad, precio]
            );

            // Actualizar el inventario
            await db.query(
                `UPDATE PRODUCTO 
                 SET PRD_EXISTENCIA = PRD_EXISTENCIA - ? 
                 WHERE PRD_ID = ?`,
                [cantidad, prd_id]
            );
        }

        res.status(200).send({ message: 'Pedido procesado exitosamente.' });
    } catch (error) {
        console.error('Error al procesar el pedido:', error);
        res.status(500).send({ error: 'Error al procesar el pedido.' });
    }
});
