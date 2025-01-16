function toggleMenu() {
    var menu = document.getElementById("menuprincipal");
    menu.classList.toggle("active");
}

// Función para guardar los valores en sessionStorage
function saveFormData() {
    const inputs = document.querySelectorAll("#registro input, #registro select");
    inputs.forEach(input => {
        sessionStorage.setItem(input.id, input.value);
    });
}

// Función para cargar los valores desde sessionStorage
function loadFormData() {
    const inputs = document.querySelectorAll("#registro input, #registro select");
    inputs.forEach(input => {
        const savedValue = sessionStorage.getItem(input.id);
        if (savedValue) {
            input.value = savedValue;
        }
    });
}

// Guardar los datos al escribir
document.querySelectorAll("#registro input, #registro select").forEach(input => {
    input.addEventListener("input", saveFormData);
});

// Cargar los datos al cargar la página
window.addEventListener("DOMContentLoaded", loadFormData);

// Asegurarnos de que el toggle-mode esté presente antes de añadir el evento
document.addEventListener("DOMContentLoaded", function () {
    const toggleModeElement = document.getElementById("toggle-mode");
    if (toggleModeElement) {
        toggleModeElement.addEventListener("change", function () {
            const body = document.body;
            const buttons = document.querySelectorAll("button, #menuprincipal a, #pie a"); // Botones y enlaces
            const divs = document.querySelectorAll("div"); // Todos los divs
            const headings = document.querySelectorAll("h1, h2, h3, h4"); // Encabezados

            if (this.checked) {
                // Cambiar al modo oscuro
                body.style.setProperty("background-color", "black", "important");
                body.style.setProperty("color", "white", "important");

                buttons.forEach(button => {
                    button.style.setProperty("background-color", "white", "important");
                    button.style.setProperty("color", "black", "important");
                });

                divs.forEach(div => {
                    div.style.setProperty("background-color", "black", "important");
                    div.style.setProperty("color", "white", "important");
                });

                headings.forEach(heading => {
                    heading.style.setProperty("color", "white", "important");
                });
            } else {
                // Cambiar al modo claro
                body.style.setProperty("background-color", "white", "important");
                body.style.setProperty("color", "black", "important");

                buttons.forEach(button => {
                    button.style.setProperty("background-color", "black", "important");
                    button.style.setProperty("color", "white", "important");
                });

                divs.forEach(div => {
                    div.style.setProperty("background-color", "white", "important");
                    div.style.setProperty("color", "black", "important");
                });

                headings.forEach(heading => {
                    heading.style.setProperty("color", "black", "important");
                });
            }
        });
    }
});

// Cambiar logo según el modo
document.addEventListener("DOMContentLoaded", function () {
    const toggleModeElement = document.getElementById("toggle-mode");
    if (toggleModeElement) {
        toggleModeElement.addEventListener("change", function () {
            const logo = document.querySelector("header img");

            if (this.checked) {
                // Cambiar al modo claro
                logo.src = "../images/logo.png"; // Ruta del logo original
            } else {
                // Cambiar al modo oscuro
                logo.src = "../images/logo_inverted.png"; // Ruta del logo invertido
            }
        });
    }
});
