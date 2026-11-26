const formulario = document.getElementById("form-login");
const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");
const mensajeError = document.getElementById("mensaje-error");

const URL_USERS = "https://6b0105ad1c637a569e52bdac.mockapi.io/api/v1/users";

// Trae todos los usuarios de mockapi
async function obtenerUsuarios() {
    try {
        const respuesta = await fetch(URL_USERS);

        if (!respuesta.ok) {
            throw new Error("Error al obtener los usuarios");
        }

        const usuarios = await respuesta.json();

        return usuarios;

    } catch (error) {
        console.error(error);
        return [];
    }
}

// Busca un usuario con ese email y password, si existe guarda la sesion y entra al sistema
async function iniciarSesion(email, password) {

    const usuarios = await obtenerUsuarios();

    const usuarioEncontrado = usuarios.find((usuario) => usuario.email === email && usuario.password === password);

    if (usuarioEncontrado) {
        sessionStorage.setItem("usuarioId", usuarioEncontrado.id);
        sessionStorage.setItem("usuarioNombre", usuarioEncontrado.nombre);
        sessionStorage.setItem("usuarioRol", usuarioEncontrado.role);
        window.location.href = "sistema.html";
    } else {
        mensajeError.textContent = "Correo o contraseña incorrectos";
    }
}

formulario.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = inputEmail.value;
    const password = inputPassword.value;

    iniciarSesion(email, password);
});