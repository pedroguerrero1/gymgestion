import { obtenerUsuarios, guardarUsuario } from "./usuarios.js";

const formulario = document.getElementById("form-registro");
const mensajeError = document.getElementById("mensaje-error");

formulario.addEventListener("submit", async (event) => {

    event.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;

    mensajeError.textContent = "";

    if (password !== password2) {
        mensajeError.textContent = "Las contraseñas no coinciden";
        return;
    }

    // no puede haber dos usuarios con el mismo mail
    const usuarios = await obtenerUsuarios();

    const existe = usuarios.find((usuario) => usuario.email === email);

    if (existe) {
        mensajeError.textContent = "Ya existe una cuenta con ese correo";
        return;
    }

    // desde el registro siempre se crean socios, los admin los crea otro admin
    const nuevoUsuario = {
        nombre: nombre,
        email: email,
        password: password,
        role: "USUARIO"
    };

    const usuarioGuardado = await guardarUsuario(nuevoUsuario);

    if (usuarioGuardado) {
        // iniciamos sesion directo con el usuario que devolvio la API
        sessionStorage.setItem("usuarioId", usuarioGuardado.id);
        sessionStorage.setItem("usuarioNombre", usuarioGuardado.nombre);
        sessionStorage.setItem("usuarioRol", usuarioGuardado.role);

        alert("¡Cuenta creada! Bienvenido a GymGestión");
        window.location.href = "sistema.html";
    } else {
        mensajeError.textContent = "No se pudo crear la cuenta, intentá de nuevo";
    }

});