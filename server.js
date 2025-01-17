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

                // Obtener PRD_ID a partir del nombre del producto
                const QUERYPRDID = 'SELECT PRD_ID FROM PRODUCTO WHERE PRD_NOMBRE = ?';
                console.log('SQL Query PRD_ID:', QUERYPRDID, [prd_id]);

                db.query(QUERYPRDID, [prd_id], (err, result) => {
                    if (err) {
                        console.error('Error getting product ID:', err.message);
                        errorOccurred = true;
                        return res.status(500).send({ error: 'Error al obtener el ID del producto.' });
                    }

                    console.log('Resultado de PRD_ID:', result);

                    if (result.length === 0) {
                        console.error('Producto no encontrado:', prd_id);
                        errorOccurred = true;
                        return res.status(400).send({ error: `Producto no encontrado: ${prd_nombre}` });
                    }

                    const prd_codigo = result[0].PRD_ID;

                    /*if (!prd_codigo || !cantidad || !precio) {
                        console.error('Producto con datos faltantes:', producto);
                        errorOccurred = true;
                        return res.status(400).send({ error: 'Datos incompletos en la lista de productos.' });
                    }*/
                    if(parseInt(prd_codigo, 10)<4){
                        
                        // Query para insertar en PEDIDO_PRODUCTO
                        const pedidoProductoSql = `
                            INSERT INTO PED_PRODUCTO (PRD_ID, PED_NUM, PED_CANT, PED_PR) 
                            VALUES (?, ?, ?, ?)
                        `;
                        console.log('SQL Query PED_PRODUCTO:', pedidoProductoSql, [prd_codigo, lastInsertedPedNum, cantidad, parseFloat(precio)]);
                        
                        db.query(pedidoProductoSql, [prd_codigo, lastInsertedPedNum, cantidad, parseFloat(precio)], (err) => {
                            if (err) {
                            console.error('Error inserting into PED_PRODUCTO table:', err.message);
                            errorOccurred = true;
                            return res.status(500).send({ error: 'Error al procesar el pedido.' });
                            }
                        });
                    }
                    else{
                        // Query para insertar en PEDIDO_PRODUCTO
                        const citaSql = `
                            INSERT INTO CITA (CEDULA, CITA_DESC, CITA_FECHA, CITA_ESTADO) 
                            VALUES (?, ?, ?, ?)
                        `;
                        console.log('SQL Query CITA:', citaSql, [cedula, prd_id, fechaPedido, "agendar"]);
                        
                        db.query(citaSql, [cedula, prd_id, fechaPedido, "agendar"], (err) => {
                            if (err) {
                            console.error('Error inserting into CITA table:', err.message);
                            errorOccurred = true;
                            return res.status(500).send({ error: 'Error al procesar el pedido.' });
                            }
                        });
                    }

                        // Query para actualizar el inventario
                        const actualizarInventarioSql = `
                            UPDATE PRODUCTO 
                            SET PRD_EXISTENCIA = PRD_EXISTENCIA - ? 
                            WHERE PRD_ID = ?
                        `;
                        console.log('SQL Query UPDATE PRODUCTO:', actualizarInventarioSql, [cantidad, prd_codigo]);

                        db.query(actualizarInventarioSql, [cantidad, prd_codigo], (err) => {
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
    app.handle(
        { method: 'POST', url: generateInvoiceUrl, body: { lastInsertedPedNum } },
        { send: (data) => res.send(data), status: res.status.bind(res) },
        () => {
            console.log('Factura generada y enviada correctamente.');
        }
    );
});
// Endpoint para generar y descargar factura
app.post('/generate-invoice', (req, res) => {
    const { lastInsertedPedNum } = req.body;

    if (!lastInsertedPedNum) {
        return res.status(400).send('El número de pedido es obligatorio.');
    }

    // Consultas para la cabecera y el cuerpo
    const headerQuery = `
        SELECT D.CEDULA AS CEDULA_RUC, P.PED_NUM AS FACTURA_NO, P.PED_FECHA AS FECHA, 
               D.NOMBRE AS NOMBRE, D.EMAIL AS CORREO, D.DIRECCION AS DIRECCION, 
               (P.PED_PR_TOT - (P.PED_PR_TOT * 0.15)) AS TOTAL_SIN_IVA, P.PED_PR_TOT AS TOTAL 
        FROM DUENIO D, PEDIDO P
        WHERE D.CEDULA = P.CEDULA AND P.PED_NUM = ?;
    `;

    const bodyQuery = `
        SELECT PD.PED_NUM AS FACTURA_NO, P.PRD_NOMBRE AS PRODUCTOS, 
               PP.PED_PR AS PRECIO_UNITARIO, PP.PED_CANT AS CANTIDAD, 
               (PP.PED_PR * PP.PED_CANT) AS SUBTOTAL 
        FROM PRODUCTO P, PED_PRODUCTO PP, PEDIDO PD
        WHERE P.PRD_ID = PP.PRD_ID AND PD.PED_NUM = PP.PED_NUM AND PD.PED_NUM = ?;
    `;

    // Ejecutar las consultas
    db.query(headerQuery, [lastInsertedPedNum], (err, headerResults) => {
        if (err) {
            console.error('Error al obtener la cabecera:', err);
            return res.status(500).send('Error al generar la factura.');
        }

        db.query(bodyQuery, [lastInsertedPedNum], (err, bodyResults) => {
            if (err) {
                console.error('Error al obtener el cuerpo:', err);
                return res.status(500).send('Error al generar la factura.');
            }

            // Generar contenido del archivo TXT
            let invoiceContent = 'FACTURA\n\n';

            if (headerResults.length > 0) {
                const header = headerResults[0];
                invoiceContent += `Cédula/RUC: ${header.CEDULA_RUC}\n`;
                invoiceContent += `Factura No: ${header.FACTURA_NO}\n`;
                invoiceContent += `Fecha: ${header.FECHA}\n`;
                invoiceContent += `Nombre: ${header.NOMBRE}\n`;
                invoiceContent += `Correo: ${header.CORREO}\n`;
                invoiceContent += `Dirección: ${header.DIRECCION}\n`;
                invoiceContent += `Total sin IVA: ${header.TOTAL_SIN_IVA}\n`;
                invoiceContent += `Total: ${header.TOTAL}\n\n`;
            }

            invoiceContent += 'DETALLE\n';
            invoiceContent += 'Producto | Precio Unitario | Cantidad | Subtotal\n';

            bodyResults.forEach((item) => {
                invoiceContent += `${item.PRODUCTOS} | ${item.PRECIO_UNITARIO} | ${item.CANTIDAD} | ${item.SUBTOTAL}\n`;
            });

            // Ruta del archivo temporal
            const filePath = path.join(__dirname, `factura_${lastInsertedPedNum}.txt`);

            // Escribir el archivo
            fs.writeFile(filePath, invoiceContent, (err) => {
                if (err) {
                    console.error('Error al escribir el archivo:', err);
                    return res.status(500).send('Error al generar la factura.');
                }

                // Enviar el archivo como descarga
                res.download(filePath, `factura_${lastInsertedPedNum}.txt`, (err) => {
                    if (err) {
                        console.error('Error al enviar el archivo:', err);
                    }

                    // Eliminar el archivo después de enviarlo
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error('Error al eliminar el archivo:', err);
                        }
                    });
                });
            });
        });
    });
});