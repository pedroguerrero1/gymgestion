import { obtenerActividades, mostrarActividades, mostrarFormularioActividad, eliminarActividad,actualizarActividad, mostrarFormularioEdicion } from "./actividades.js";

import {obtenerUsuarios, mostrarUsuarios, mostrarFormularioUsuario, mostrarFormularioEdicionUsuario, eliminarUsuario} from "./usuarios.js";

import {obtenerReservasCompletas, mostrarReservas, cancelarReserva, guardarReserva, hayCupoDisponible, obtenerMisReservas} from "./reservas.js";


// Si no hay sesion iniciada vuelve al login
let usuarioId = sessionStorage.getItem("usuarioId");

if (!usuarioId) {
    window.location.href = "index.html";
}

let usuarioRol = sessionStorage.getItem("usuarioRol");

// Oculta lo que tiene data-role y no corresponde al rol del usuario
function controlarAccesos() {

    document.querySelectorAll("[data-role]").forEach(function(elemento) {

        if (elemento.dataset.role !== usuarioRol.toLowerCase()) {
            elemento.style.display = "none";
        }

    });

}

controlarAccesos();



let contenido = document.getElementById("contenido-principal");

let btnInicio = document.getElementById("inicio");
let btnActividades = document.getElementById("actividades");
let btnUsuarios = document.getElementById("usuarios");
let btnGestionReservas = document.getElementById("gestion-reservas");
let btnMisReservas = document.getElementById("mis-reservas");
let btnCerrarSesion = document.getElementById("cerrar-sesion");

function cambiarActivo(enlace) {

    document.querySelectorAll(".nav-sidebar .nav-link").forEach(function(item) {
        item.classList.remove("active");
    });

    enlace.classList.add("active");
}

// ---- Eventos del menu lateral ----

btnInicio.addEventListener("click", function(event) {

    event.preventDefault();

    cambiarActivo(btnInicio);

    contenido.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Bienvenido a GymGestión</h3>
            </div>

            <div class="card-body">
                <p>Panel principal del sistema de gestión del gimnasio</p>
            </div>
        </div>
    `;

});


btnActividades.addEventListener("click", async function(event) {

    event.preventDefault();

    cambiarActivo(btnActividades);

    let actividades = await obtenerActividades();

    mostrarActividades(actividades,contenido);

    controlarAccesos();

});

btnUsuarios.addEventListener("click", async function(event) {

    event.preventDefault();

    cambiarActivo(btnUsuarios);

    let usuarios = await obtenerUsuarios();

    mostrarUsuarios(usuarios, contenido);

});

btnGestionReservas.addEventListener("click", async function(event) {

    event.preventDefault();

    cambiarActivo(btnGestionReservas);

    let reservas = await obtenerReservasCompletas();

    mostrarReservas(reservas,contenido);

    controlarAccesos();

});

btnMisReservas.addEventListener("click", async function(event) {

    event.preventDefault();

    cambiarActivo(btnMisReservas);

    let reservas = await obtenerMisReservas(usuarioId);

    mostrarReservas(reservas, contenido);

    controlarAccesos();

});

btnCerrarSesion.addEventListener("click", function(event) {

    event.preventDefault();

    // borramos los datos guardados en el login
    sessionStorage.clear();

    window.location.href = "index.html";

});

// ---- Eventos de los botones que se cargan dentro del contenido ----

contenido.addEventListener("click", function(event) {



    if (event.target.closest("#btn-nueva-actividad")) {
        mostrarFormularioActividad(contenido);
    }

    if (event.target.closest("#btn-nuevo-usuario")) {
    mostrarFormularioUsuario(contenido);
}

});



contenido.addEventListener("click", async function(event) {

    let botonEditar = event.target.closest(".btn-editar");
    let botonEliminar = event.target.closest(".btn-eliminar");

    if (botonEditar && botonEditar.dataset.id) {

        let id = botonEditar.dataset.id;

        let actividades = await obtenerActividades();

        let actividadEncontrada = actividades.find(function(actividad){
            return actividad.id === id;
        });

        mostrarFormularioEdicion(actividadEncontrada, contenido);
    }

    if (botonEliminar && botonEliminar.dataset.id) {

        let id = botonEliminar.dataset.id;

        let confirmar = confirm("¿Estás seguro de eliminar esta actividad?");

        if (confirmar) {

            let resultado = await eliminarActividad(id);

            if (resultado) {
                alert("Actividad eliminada correctamente");

                let actividades = await obtenerActividades();
                mostrarActividades(actividades, contenido);
            }

        }
    }

});


contenido.addEventListener("click", async function(event) {

    let botonEditar = event.target.closest(".btn-editar-usuario");

    if (botonEditar && botonEditar.dataset.id) {

        let id = botonEditar.dataset.id;

        let usuarios = await obtenerUsuarios();

        let usuarioEncontrado = usuarios.find(function(usuario) {
            return usuario.id === id;
        });

        mostrarFormularioEdicionUsuario(usuarioEncontrado, contenido);
    }

});


contenido.addEventListener("click", async function(event) {

    let botonEliminar = event.target.closest(".btn-eliminar-usuario");

    if (botonEliminar && botonEliminar.dataset.id) {

        let id = botonEliminar.dataset.id;

        let confirmar = confirm("¿Estás seguro de eliminar este usuario?");

        if (confirmar) {

            let resultado = await eliminarUsuario(id);

            if (resultado) {
                alert("Usuario eliminado correctamente");

                let usuarios = await obtenerUsuarios();
                mostrarUsuarios(usuarios, contenido);
            }
        }
    }

});

contenido.addEventListener("click", async function(event) {

    let botonCancelar = event.target.closest(".btn-cancelar-reserva");

    if (botonCancelar && botonCancelar.dataset.id) {

        let id = botonCancelar.dataset.id;

        let confirmar = confirm("¿Estás seguro de cancelar esta reserva?");

        if (confirmar) {

            let resultado = await cancelarReserva(id);

            if (resultado) {
                alert("Reserva cancelada correctamente");

                // el admin vuelve a ver todas, el socio solo las suyas
                let reservas;

                if (usuarioRol === "ADMIN") {
                    reservas = await obtenerReservasCompletas();
                } else {
                    reservas = await obtenerMisReservas(usuarioId);
                }

                mostrarReservas(reservas, contenido);
            }
        }
    }

});

contenido.addEventListener("click", async function(event) {

    let botonReservar = event.target.closest(".btn-reservar");

    if (botonReservar) {

        let activityId = botonReservar.dataset.id;

        let disponible = await hayCupoDisponible(activityId);

        if (!disponible) {
            alert("No hay cupos disponibles para esta actividad");
            return;
        }

        let confirmar = confirm("¿Querés reservar esta actividad?");

        if (!confirmar) {
            return;
        }

        // fecha de hoy en formato YYYY-MM-DD
        let fecha = new Date();

        let fechaReserva = 
            fecha.getFullYear() + "-" +
            String(fecha.getMonth() + 1).padStart(2, "0") + "-" +
            String(fecha.getDate()).padStart(2, "0");

        let datos = {
            userId: usuarioId,
            activityId: activityId,
            fecha: fechaReserva,
            estado: "confirmada"
        };

        let reserva = await guardarReserva(datos);

        if (reserva) {
            alert("¡Reserva realizada correctamente!");
        } else {
            alert("No se pudo realizar la reserva");
        }
    }
});