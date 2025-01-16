// Función para mostrar el modal de inicio de sesión
function showLogin() {
    document.getElementById("login-modal").classList.remove("hidden");
}

// Función para cerrar el modal de inicio de sesión
function closeLogin() {
    document.getElementById("login-modal").classList.add("hidden");
}

// Manejar el inicio de sesión
document.getElementById("login-button").addEventListener("click", function () {
    const user1 = '1000732592';
    const clave = 'pass3822';

    // Verificar que los campos no estén vacíos
    if (!user1 || !clave) {
        alert("Por favor, ingresa tu usuario y contraseña.");
        return;
    }

    // Enviar credenciales al servidor
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cedula: user1, contrasena: clave }),
    })
    .then(response => {
        if (response.ok) {
            // Inicio de sesión exitoso
            alert("Inicio de sesión exitoso");
            sessionStorage.setItem("loggedIn", "true");
            closeLogin();
            toggleCart();
        } else {
            // Error en las credenciales
            alert("Usuario o contraseña incorrectos");
        }
    })
    .catch(error => {
        console.error("Error al conectar con el servidor:", error);
        alert("Hubo un problema con la conexión al servidor. Inténtalo nuevamente.");
    });
});

let productoActual = '';
let descripcionActual = '';
let imagenesActuales = [];
let imagenPrincipal = '';
let carrito = [];

// Abre el modal de un producto con sus datos
function abrirModal(nombreProducto, descripcion, imagenes) {
    productoActual = nombreProducto;
    descripcionActual = descripcion;
    imagenesActuales = imagenes;

    // Mostrar el modal
    document.getElementById("modal").style.display = "flex";

    // Establecer la primera imagen como principal
    imagenPrincipal = imagenes[0];
    document.getElementById("main-img").src = imagenPrincipal;

    // Mostrar la descripción del producto
    document.getElementById("modal-desc").textContent = descripcion;

    // Generar miniaturas
    const contenedorMiniaturas = document.getElementById("modal-img-container");
    contenedorMiniaturas.innerHTML = '';
    imagenes.forEach((imgSrc, index) => {
        const img = document.createElement("img");
        img.src = imgSrc;
        img.className = "modal-img" + (index === 0 ? " active" : "");
        img.onclick = function () {
            seleccionarImagenPrincipal(imgSrc);
        };
        contenedorMiniaturas.appendChild(img);
    });
}

// Selecciona la imagen principal desde las miniaturas
function seleccionarImagenPrincipal(src) {
    imagenPrincipal = src;
    document.getElementById("main-img").src = src;

    // Actualiza las clases activas
    const miniaturas = document.querySelectorAll(".modal-img");
    miniaturas.forEach(img => img.classList.remove("active"));
    document.querySelector(`.modal-img[src="${src}"]`).classList.add("active");
}

// Cierra el modal del producto
function cerrarModal() {
    document.getElementById("modal").style.display = "none";
}
// Función para guardar el carrito en localStorage
function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Función para cargar el carrito desde localStorage
function cargarCarrito() {
    const carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarCarrito();
    }
}
// Añade el producto actual al carrito
function comprarProducto() {
    const cantidad = parseInt(document.getElementById('cantidad').value) || 1;

    const productos = document.querySelectorAll('.item');
    let productoSeleccionado = null;

    productos.forEach(producto => {
        const nombre = producto.getAttribute('data-nombre');
        if (nombre === productoActual) {
            productoSeleccionado = producto;
        }
    });

    if (!productoSeleccionado) {
        alert('Error: Producto no encontrado.');
        return;
    }

    const precio = parseFloat(productoSeleccionado.getAttribute('data-precio'));
    const imagen = productoSeleccionado.querySelector('img').src;

    // Agrega el producto al carrito
    carrito.push({
        nombre: productoActual,
        precio: precio,
        cantidad: cantidad,
        imagen: imagen
    });

    alert(`Has añadido ${cantidad} unidad(es) de ${productoActual} al carrito.`);
    actualizarCarrito();
    guardarCarrito(); // Guardar el carrito
    cerrarModal();
}

// Actualiza el contenido del carrito
function actualizarCarrito() {
    const cartItems = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('subtotal');
    const ivaEl = document.getElementById('iva');
    const totalEl = document.getElementById('total');

    // Limpia el contenido del carrito
    cartItems.innerHTML = '';
    let subtotal = 0;

    // Recorre los productos en el carrito
    carrito.forEach((item, index) => {
        const itemTotal = item.precio * item.cantidad;
        subtotal += itemTotal;

        // Crea el elemento del producto en el carrito
        const listItem = document.createElement('li');
        listItem.style.display = 'flex';
        listItem.style.alignItems = 'center';
        listItem.style.marginBottom = '10px';

        // Imagen del producto
        const productImg = document.createElement('img');
        productImg.src = item.imagen; // Asegúrate de que los productos tengan una URL de imagen
        productImg.alt = item.nombre;
        productImg.style.width = '50px';
        productImg.style.height = '50px';
        productImg.style.marginRight = '10px';

        // Información del producto
        const productInfo = document.createElement('div');
        productInfo.innerHTML = `
            <p><strong>${item.nombre}</strong></p>
            <p>Cantidad: ${item.cantidad}</p>
            <p>Precio: $${item.precio.toFixed(2)}</p>
            <p>Total: $${itemTotal.toFixed(2)}</p>
        `;
        productInfo.style.flexGrow = '1';

        // Botón de eliminar
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.style.marginLeft = '10px';
        deleteBtn.onclick = () => eliminarProducto(index);

        // Añade los elementos al elemento del carrito
        listItem.appendChild(productImg);
        listItem.appendChild(productInfo);
        listItem.appendChild(deleteBtn);

        cartItems.appendChild(listItem);
    });

    // Calcula IVA y total
    const iva = subtotal * 0.15;
    const total = subtotal + iva;

    // Actualiza los valores en el resumen
    subtotalEl.textContent = subtotal.toFixed(2);
    ivaEl.textContent = iva.toFixed(2);
    totalEl.textContent = total.toFixed(2);
}

// Elimina un producto del carrito
function eliminarProducto(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
    guardarCarrito(); // Guardar el carrito
}

// Llama a cargarCarrito al cargar la página
window.addEventListener("DOMContentLoaded", cargarCarrito);

// Abre y cierra el modal del carrito
function toggleCart() {
    const cartModal = document.getElementById('cart-modal');
    cartModal.classList.toggle('hidden');
}

// Validar sesión antes de proceder a la compra
document.getElementById("checkout-button").addEventListener("click", function () {
    const isLoggedIn = sessionStorage.getItem("loggedIn");

    if (isLoggedIn === "true") {
        // Verificar que el carrito no esté vacío
        if (carrito.length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }

        // Obtener la cédula del usuario logeado (en este caso almacenada como user1)
        const cedula = '1000732592'; // Cambia esto según tu implementación

        // Preparar los datos del pedido
        const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
        const fechaPedido = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const fechaEntrega = new Date(); // Fecha estimada de entrega (ejemplo: +7 días)
        fechaEntrega.setDate(fechaEntrega.getDate() + 7);
        const fechaEntregaStr = fechaEntrega.toISOString().split('T')[0];

        // Enviar los datos al servidor
        fetch('/procesar-pedido', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cedula: cedula,
                total: total.toFixed(2),
                fechaPedido: fechaPedido,
                fechaEntrega: fechaEntregaStr,
                productos: carrito.map(item => ({
                    prd_id: item.nombre, // Ajustar según el formato de ID en el carrito
                    cantidad: item.cantidad,
                    precio: item.precio,
                })),
            }),
        })
        .then(response => {
            if (response.ok) {
                // Procesar respuesta exitosa
                alert("Compra realizada exitosamente. ¡Gracias!");
                carrito = [];
                actualizarCarrito(); // Actualizar el carrito en el frontend
                toggleCart(); // Cerrar el carrito
                guardarCarrito(); // Limpiar el carrito en localStorage
            } else {
                alert("Hubo un error al procesar el pedido. Inténtalo nuevamente.");
            }
        })
        .catch(error => {
            console.error("Error al conectar con el servidor:", error);
            alert("Error al procesar el pedido. Verifica tu conexión e inténtalo nuevamente.");
        });
    } else {
        alert("Por favor, inicia sesión para proceder a la compra.");
        toggleCart();
        showLogin();
    }
});
