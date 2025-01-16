let productoActual = '';
let descripcionActual = '';
let imagenesActuales = [];
let imagenPrincipal = '';
let carrito = [];

// Función para mostrar el modal de inicio de sesión
function showLogin() {
    document.getElementById("login-modal").classList.remove("hidden");
}

// Función para cerrar el modal de inicio de sesión
function closeLogin() {
    document.getElementById("login-modal").classList.add("hidden");
}

document.getElementById("login-button").addEventListener("click", function () {
    const user1 = document.getElementById("username").value.trim();
    const clave = document.getElementById("password1").value.trim();

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
            alert("Inicio de sesión exitoso");
            sessionStorage.setItem("loggedIn", "true");
            sessionStorage.setItem("userCedula", user1); // Guardar la cédula para futuras consultas
            closeLogin();
            toggleCart();
        } else {
            alert("Usuario o contraseña incorrectos");
        }
    })
    .catch(error => {
        console.error("Error al conectar con el servidor:", error);
        alert("Hubo un problema con la conexión al servidor. Inténtalo nuevamente.");
    });
});

// Función para actualizar el carrito
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

// Carga el carrito desde localStorage
function cargarCarrito() {
    const carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarCarrito();
    }
}

// Guarda el carrito en localStorage
function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Función para cargar los productos
function cargarProductos() {
    fetch('/productos') // Solicita el endpoint para obtener los productos
        .then(response => response.json())
        .then(data => {
            console.log("Datos de productos:", data); // Verifica lo que llega del servidor
            if (data && data.data) {
                const productos = data.data.map(producto => {
                    return {
                        prd_id: producto[0],          // PRD_ID
                        nombre: producto[1],          // PRD_NOMBRE
                        precio: producto[2],          // PRD_PRECIO
                        existencia: producto[3],      // PRD_EXISTENCIA
                        descripcion: producto[4],     // PRD_DESC
                        imagenPrincipal: producto[5], // PRD_I_P
                        imagenes: producto[10],       // PRD_I_S (imagenes adicionales)
                    };
                });
                // Aquí deberías insertar el código para mostrar estos productos en la página
            } else {
                alert("No se pudieron cargar los productos.");
            }
        })
        .catch(error => {
            console.error("Error al cargar los productos:", error);
            alert("Hubo un problema al cargar los productos. Inténtalo nuevamente.");
        });
}

// Función para abrir el modal de producto
function abrirModal(prdId) {
    fetch('/productos')  // Nuevamente solicitamos los productos desde el endpoint
        .then(response => response.json())
        .then(data => {
            const producto = data.data.find(p => p[0] === prdId); // Busca el producto por PRD_ID
            if (producto) {
                productoActual = producto[0];
                descripcionActual = producto[4];
                imagenesActuales = producto[10];
                imagenPrincipal = producto[5]; // Asumimos que la primera imagen es la principal

                document.getElementById("modal").style.display = "flex";
                document.getElementById("main-img").src = imagenPrincipal;
                document.getElementById("modal-desc").textContent = descripcionActual;

                const contenedorMiniaturas = document.getElementById("modal-img-container");
                contenedorMiniaturas.innerHTML = '';
                imagenesActuales.forEach((imgSrc, index) => {
                    const img = document.createElement("img");
                    img.src = imgSrc;
                    img.className = "modal-img" + (index === 0 ? " active" : "");
                    img.onclick = function () {
                        seleccionarImagenPrincipal(imgSrc);
                    };
                    contenedorMiniaturas.appendChild(img);
                });
            } else {
                alert("Producto no encontrado.");
            }
        })
        .catch(error => {
            console.error("Error al cargar el producto:", error);
            alert("Hubo un problema al cargar los detalles del producto. Inténtalo nuevamente.");
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

// Función para añadir un producto al carrito
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

// Abre y cierra el modal del carrito
function toggleCart() {
    const cartModal = document.getElementById('cart-modal');
    cartModal.classList.toggle('hidden');
}

// Validar sesión antes de proceder a la compra
document.getElementById("checkout-button").addEventListener("click", function () {
    if (!sessionStorage.getItem("loggedIn")) {
        alert("Debes iniciar sesión para realizar la compra.");
        showLogin();
    } else {
        alert("Redirigiendo a la página de pago...");
        // Aquí podrías redirigir al usuario al proceso de pago
    }
});

// Carga el carrito al iniciar
cargarCarrito();

// Cargar productos
cargarProductos();
