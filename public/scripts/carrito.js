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

let productoActual = '';
let descripcionActual = '';
let imagenesActuales = [];
let imagenPrincipal = '';
let carrito = [];

// Función para cargar los productos desde la base de datos
// Función para cargar los productos desde la base de datos
function cargarProductos() {
    fetch('/productos') // Solicita el endpoint para obtener los productos
        .then(response => response.json())
        .then(data => {
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
                // Ahora podemos actualizar los productos en el carrito si es necesario
                actualizarProductosEnCarrito(productos);
            } else {
                alert("No se pudieron cargar los productos.");
            }
        })
        .catch(error => {
            console.error("Error al cargar los productos:", error);
            alert("Hubo un problema al cargar los productos. Inténtalo nuevamente.");
        });
}

// Función para actualizar los productos en el carrito usando los datos cargados
function actualizarProductosEnCarrito(productos) {
    carrito = carrito.map(item => {
        const producto = productos.find(prod => prod.prd_id === item.nombre); // Usamos PRD_ID
        if (producto) {
            return {
                ...item,
                precio: producto.precio,
                descripcion: producto.descripcion,
                imagen: producto.imagenPrincipal,
            };
        }
        return item;
    });
    actualizarCarrito();
}

// Abre el modal de un producto con detalles completos
function abrirModal(prdId) {
    fetch(`/productos`)  // Reutilizamos el endpoint para obtener los productos completos
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

// Función para añadir producto al carrito usando PRD_ID
function comprarProducto() {
    const cantidad = parseInt(document.getElementById('cantidad').value) || 1;

    fetch(`/productos`)  // Nuevamente solicitamos los productos desde el endpoint
        .then(response => response.json())
        .then(data => {
            const producto = data.data.find(p => p[0] === productoActual); // Buscamos el producto por PRD_ID
            if (!producto) {
                alert('Error: Producto no encontrado.');
                return;
            }

            const precio = producto[2]; // PRD_PRECIO
            const imagen = producto[5]; // PRD_I_P

            carrito.push({
                nombre: producto[0], // Usamos PRD_ID
                precio: precio,
                cantidad: cantidad,
                imagen: imagen
            });

            alert(`Has añadido ${cantidad} unidad(es) de ${producto[1]} al carrito.`); // Mostramos el nombre en el alert
            actualizarCarrito();
            guardarCarrito(); // Guardamos el carrito
            cerrarModal();
        })
        .catch(error => {
            console.error("Error al agregar el producto al carrito:", error);
            alert("Hubo un problema al agregar el producto. Inténtalo nuevamente.");
        });
}

// Llamar a cargar los productos cuando se carga la página
window.addEventListener("DOMContentLoaded", cargarProductos);
