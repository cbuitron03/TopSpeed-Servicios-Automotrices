document.getElementById('registro').addEventListener('submit', function(event){
    event.preventDefault();

    const form = document.getElementById('registro');
    const cedula = document.getElementById('cedula').value.trim();
	const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const dob = document.getElementById('dob').value.trim();
    const gender = document.getElementById('gender').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmpassword = document.getElementById('confirm-password').value.trim();
    const placa = document.getElementById('placa').value.trim();
    const marca = document.getElementById('marca').value.trim();
    const modelo = document.getElementById('modelo').value.trim();
    const color = document.getElementById('color').value.trim();
    const anio = document.getElementById('anio').value.trim();

    if (password == confirmpassword){
        fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({cedula, name, email, phone, address, dob, gender, password, placa, marca, modelo, color, anio})
        })
        .then(response => response.json())
        .then(data => alert(data.message))
        .catch(error => console.error('Error:', error))
    }
    else {
        alert("Las contraseñas no coinciden");
    }
});