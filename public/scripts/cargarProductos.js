document.addEventListener('DOMContentLoaded', function() {
    // Realizar la solicitud para obtener los productos
    fetch('./productos.json')
    .then(response => response.json())
    .then(data => {
        console.log(data); // Verifica los datos en la consola
        renderProductos(data.data); // Renderiza los productos en los divs
    })
    .catch(error => console.error('Error al cargar el archivo JSON:', error));

    fetch('/productos')
        .then(response => response.json())
        .then(data => {
            const productos = data.data; // Array con los productos
            const galeria = document.querySelector('.galeria'); // Elemento contenedor de la galería

            // Limpiar la galería antes de cargar los nuevos productos
            galeria.innerHTML = '';

            // Iterar sobre cada producto y agregarlo al DOM
            productos.forEach(producto => {
                const item = document.createElement('div');
                item.classList.add('item');
                item.setAttribute('data-nombre', producto[4]);  // Nombre del producto
                item.setAttribute('data-precio', producto[2]); // Precio del producto

                // Crear la imagen
                const img = document.createElement('img');
                img.classList.add('imagen');
                img.src = producto[5];  // Imagen principal
                img.width = 327; // Ancho de la imagen (ajustar si es necesario)
                img.height = 410; // Alto de la imagen (ajustar si es necesario)
                img.alt = producto[4]; // Descripción alternativa para la imagen
                img.onclick = function() {
                    abrirModal(producto[4], producto[9], producto.slice(10, 13));  // Abrir modal con imágenes adicionales
                };

                // Crear la descripción
                const descripcion = document.createElement('div');
                descripcion.classList.add('descripcion');
                descripcion.textContent = `${producto[4]} - $${producto[2].toFixed(2)}`;

                // Agregar la imagen y la descripción al item
                item.appendChild(img);
                item.appendChild(descripcion);

                // Agregar el item a la galería
                galeria.appendChild(item);
            });
        })
        .catch(error => {
            console.error('Error al cargar los productos:', error);
        });
});
