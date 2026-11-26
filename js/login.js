let formulario = document.getElementById("form-login");
let inputEmail = document.getElementById("email");
let inputPassword = document.getElementById("password");
let mensajeError = document.getElementById("mensaje-error");

const URL_USERS = "https://6b0105ad1c637a569e52bdac.mockapi.io/api/v1/users";

// Trae todos los usuarios de mockapi
async function obtenerUsuarios() {
    try {
        let respuesta = await fetch(URL_USERS);

        if (!respuesta.ok) {
            throw new Error("Error al obtener los usuarios");
        }

        let usuarios = await respuesta.json();

        return usuarios;

    } catch (error) {
        console.error(error);
        return [];
    }
}

// Busca un usuario con ese email y password, si existe guarda la sesion y entra al sistema
async function iniciarSesion(email, password) {

    let usuarios = await obtenerUsuarios();

    let usuarioEncontrado = usuarios.find(function(usuario) {
        return usuario.email === email && usuario.password === password;
    });

    if (usuarioEncontrado) {
        sessionStorage.setItem("usuarioId", usuarioEncontrado.id);
        sessionStorage.setItem("usuarioNombre", usuarioEncontrado.nombre);
        sessionStorage.setItem("usuarioRol", usuarioEncontrado.role);
        window.location.href = "sistema.html";
    } else {
        mensajeError.textContent = "Correo o contraseña incorrectos";
    }
}

formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    let email = inputEmail.value;
    let password = inputPassword.value;

    iniciarSesion(email, password);
});