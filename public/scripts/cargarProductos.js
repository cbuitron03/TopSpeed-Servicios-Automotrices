// Función para cargar los productos desde el archivo JSON
document.addEventListener("DOMContentLoaded", function() {
    fetch('../productos.json')  // Ruta del archivo JSON
        .then(response => response.json())
        .then(data => cargarGaleria(data.data))
        .catch(error => console.error('Error cargando los datos:', error));
});

// Función para cargar la galería con los productos
function cargarGaleria(productos) {
    const categorias = {
        "Accesorios Off-Road": document.querySelector('.galeria[data-categoria="accesorios"]'),
        "Mantenimiento": document.querySelector('.galeria[data-categoria="mantenimiento"]'),
        "Detailing": document.querySelector('.galeria[data-categoria="detailing"]')
    };

    productos.forEach(producto => {
        const [
            id, nombre, precio, stock, descripcion, imgMiniatura, ancho, alto, nombreModal, descripcionModal, imagenesModal
        ] = producto;

        // Crear el contenedor del producto
        const item = document.createElement('div');
        item.classList.add('item');
        item.setAttribute('data-nombre', nombre);
        item.setAttribute('data-precio', precio);

        // Crear la imagen del producto
        const img = document.createElement('img');
        img.classList.add('imagen');
        img.src = imgMiniatura;
        img.width = ancho;
        img.height = alto;
        img.alt = nombre;
        img.onclick = () => abrirModal(nombreModal, descripcionModal, imagenesModal);

        // Crear la descripción del producto
        const divDescripcion = document.createElement('div');
        divDescripcion.classList.add('descripcion');
        divDescripcion.textContent = `${nombre} - $${precio}`;

        // Añadir la imagen y descripción al item
        item.appendChild(img);
        item.appendChild(divDescripcion);

        // Añadir el item a la categoría correspondiente
        if (categorias[nombre]) {
            categorias[nombre].appendChild(item);
        }
    });
}

// Función para abrir el modal con el producto
function abrirModal(nombre, descripcion, imagenes) {
    const modal = document.getElementById('modal');
    const modalImgContainer = document.getElementById('modal-img-container');
    const mainImg = document.getElementById('main-img');
    const modalDesc = document.getElementById('modal-desc');

    // Limpiar el contenedor de imágenes y agregar nuevas
    modalImgContainer.innerHTML = '';
    imagenes.forEach(imagen => {
        const img = document.createElement('img');
        img.src = imagen;
        img.alt = nombre;
        modalImgContainer.appendChild(img);
    });

    mainImg.src = imagenes[0];
    modalDesc.textContent = descripcion;

    // Mostrar el modal
    modal.style.display = 'block';
}

// Función para cerrar el modal
function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}
