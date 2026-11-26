import { obtenerActividades, mostrarActividades, mostrarFormularioActividad, eliminarActividad,actualizarActividad, mostrarFormularioEdicion, mostrarTarjetasActividades } from "./actividades.js";

import {obtenerUsuarios, mostrarUsuarios, mostrarFormularioUsuario, mostrarFormularioEdicionUsuario, eliminarUsuario} from "./usuarios.js";

import {obtenerReservasCompletas, mostrarReservas, cambiarEstadoReserva, guardarReserva, hayCupoDisponible, obtenerMisReservas, obtenerReservas, mostrarFiltroActividades, filtrarPorActividad} from "./reservas.js";

import { mostrarDashboard } from "./dashboard.js";


// Si no hay sesion iniciada vuelve al login
let usuarioId = sessionStorage.getItem("usuarioId");

if (!usuarioId) {
    window.location.href = "index.html";
}

let usuarioRol = sessionStorage.getItem("usuarioRol");

const esAdmin = usuarioRol === "ADMIN";

// Oculta lo que tiene data-role y no corresponde al rol del usuario
function controlarAccesos() {

    document.querySelectorAll("[data-role]").forEach(function(elemento) {

        if (elemento.dataset.role !== usuarioRol) {
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
let btnDashboard = document.getElementById("dashboard");
let btnCerrarSesion = document.getElementById("cerrar-sesion");

function cambiarActivo(enlace) {

    document.querySelectorAll(".nav-sidebar .nav-link").forEach(function(item) {
        item.classList.remove("active");
    });

    enlace.classList.add("active");

    // el titulo de arriba toma el nombre de la opcion elegida
    const nombreSeccion = enlace.querySelector("p").textContent;

    document.getElementById("titulo-seccion").textContent = nombreSeccion;
    document.getElementById("breadcrumb-seccion").textContent = nombreSeccion;
}

// nombre y rol arriba a la derecha
const usuarioNombre = sessionStorage.getItem("usuarioNombre");

let textoRol = "Socio";

if (usuarioRol === "ADMIN") {
    textoRol = "Administrador";
}

document.getElementById("usuario-nav").textContent = `${usuarioNombre} (${textoRol})`;


// Pantalla de inicio: saludo, accesos rapidos y (para el socio) sus proximas clases
async function mostrarInicio() {

    let accesos = `
        <div class="col-md-4">
            <button class="btn btn-acceso btn-block" data-ir="actividades">
                <i class="fas fa-dumbbell"></i> Ver actividades
            </button>
        </div>
        <div class="col-md-4">
            <button class="btn btn-acceso btn-block" data-ir="mis-reservas">
                <i class="fas fa-calendar-alt"></i> Mis reservas
            </button>
        </div>
    `;

    if (usuarioRol === "ADMIN") {
        accesos = `
            <div class="col-md-4">
                <button class="btn btn-acceso btn-block" data-ir="actividades">
                    <i class="fas fa-dumbbell"></i> Actividades
                </button>
            </div>
            <div class="col-md-4">
                <button class="btn btn-acceso btn-block" data-ir="gestion-reservas">
                    <i class="fas fa-calendar-check"></i> Reservas
                </button>
            </div>
            <div class="col-md-4">
                <button class="btn btn-acceso btn-block" data-ir="dashboard">
                    <i class="fas fa-chart-bar"></i> Dashboard
                </button>
            </div>
        `;
    }

    contenido.innerHTML = `
        <div class="card card-bienvenida">
            <div class="card-body">
                <h2 id="saludo"></h2>
                <p class="mb-0">¿Qué querés hacer hoy?</p>
            </div>
        </div>

        <div class="row mb-3">
            ${accesos}
        </div>

        <div id="proximas-clases"></div>
    `;

    // en el saludo va solo el primer nombre
    const primerNombre = usuarioNombre.split(" ")[0];

    document.getElementById("saludo").textContent = `¡Hola, ${primerNombre}!`;

    if (usuarioRol === "ADMIN") {
        return;
    }

    const misReservas = await obtenerMisReservas(usuarioId);

    const confirmadas = misReservas.filter((reserva) => reserva.estado === "confirmada");

    const tarjeta = document.createElement("div");
    tarjeta.className = "card";

    const header = document.createElement("div");
    header.className = "card-header";

    const titulo = document.createElement("h3");
    titulo.className = "card-title";
    titulo.textContent = "Tus próximas clases";

    header.append(titulo);

    const lista = document.createElement("ul");
    lista.className = "list-group list-group-flush";

    if (confirmadas.length === 0) {
        const vacio = document.createElement("li");
        vacio.className = "list-group-item text-muted";
        vacio.textContent = "Todavía no tenés clases reservadas. ¡Anotate en una!";
        lista.append(vacio);
    }

    confirmadas.forEach((reserva) => {
        const item = document.createElement("li");
        item.className = "list-group-item";
        item.textContent = `${reserva.actividad.nombre} - ${reserva.actividad.dias} a las ${reserva.actividad.horario}`;
        lista.append(item);
    });

    tarjeta.append(header, lista);

    document.getElementById("proximas-clases").append(tarjeta);
}

// ---- Eventos del menu lateral ----

btnInicio.addEventListener("click", function(event) {

    event.preventDefault();

    cambiarActivo(btnInicio);

    mostrarInicio();

});


// El admin ve la tabla para editar, el socio ve las cards para reservar
async function cargarActividades() {

    const actividades = await obtenerActividades();

    if (usuarioRol === "ADMIN") {
        mostrarActividades(actividades, contenido);
        controlarAccesos();
    } else {
        const reservas = await obtenerReservas();
        mostrarTarjetasActividades(actividades, reservas, usuarioId, contenido);
    }
}

btnActividades.addEventListener("click", async function(event) {

    event.preventDefault();

    cambiarActivo(btnActividades);

    await cargarActividades();

});

btnUsuarios.addEventListener("click", async function(event) {

    // solo el admin puede hacer esto
    if (!esAdmin) {
        return;
    }

    event.preventDefault();

    cambiarActivo(btnUsuarios);

    let usuarios = await obtenerUsuarios();

    mostrarUsuarios(usuarios, contenido);

});

// Tabla de reservas del admin con la lista para filtrar por actividad
async function cargarGestionReservas(filtro) {

    const reservas = await obtenerReservasCompletas();
    const actividades = await obtenerActividades();

    mostrarReservas(reservas, contenido, usuarioRol);
    mostrarFiltroActividades(actividades, contenido);

    // si venia filtrado, se mantiene la misma actividad
    document.getElementById("filtro-actividad").value = filtro;
    filtrarPorActividad(filtro, contenido);

    controlarAccesos();
}

btnGestionReservas.addEventListener("click", async function(event) {

    // solo el admin puede hacer esto
    if (!esAdmin) {
        return;
    }

    event.preventDefault();

    cambiarActivo(btnGestionReservas);

    await cargarGestionReservas("");

});

btnMisReservas.addEventListener("click", async function(event) {

    event.preventDefault();

    cambiarActivo(btnMisReservas);

    let reservas = await obtenerMisReservas(usuarioId);

    mostrarReservas(reservas, contenido, usuarioRol);

    controlarAccesos();

});

btnDashboard.addEventListener("click", async function(event) {

    // solo el admin puede hacer esto
    if (!esAdmin) {
        return;
    }

    event.preventDefault();

    cambiarActivo(btnDashboard);

    await mostrarDashboard(contenido);

});

btnCerrarSesion.addEventListener("click", function(event) {

    event.preventDefault();

    // borramos los datos guardados en el login
    sessionStorage.clear();

    window.location.href = "index.html";

});

// ---- Eventos de los botones que se cargan dentro del contenido ----

contenido.addEventListener("click", function(event) {

    // solo el admin puede hacer esto
    if (!esAdmin) {
        return;
    }

    if (event.target.closest("#btn-nueva-actividad")) {
        mostrarFormularioActividad(contenido);
    }

    if (event.target.closest("#btn-nuevo-usuario")) {
        mostrarFormularioUsuario(contenido);
    }

});



contenido.addEventListener("click", async function(event) {

    // solo el admin puede hacer esto
    if (!esAdmin) {
        return;
    }

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

    // solo el admin puede hacer esto
    if (!esAdmin) {
        return;
    }

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

    // solo el admin puede hacer esto
    if (!esAdmin) {
        return;
    }

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

            let resultado = await cambiarEstadoReserva(id, "cancelada");

            if (resultado) {
                alert("Reserva cancelada correctamente");

                // el admin vuelve a ver todas, el socio solo las suyas
                let reservas;

                if (usuarioRol === "ADMIN") {
                    reservas = await obtenerReservasCompletas();
                } else {
                    reservas = await obtenerMisReservas(usuarioId);
                }

                mostrarReservas(reservas, contenido, usuarioRol);
            }
        }
    }

});

// cuando el admin cambia el estado en la lista se guarda en la API
contenido.addEventListener("change", async function(event) {

    // solo el admin puede hacer esto
    if (!esAdmin) {
        return;
    }

    let select = event.target.closest(".select-estado");

    if (select) {

        let id = select.dataset.id;
        let nuevoEstado = select.value;

        let resultado = await cambiarEstadoReserva(id, nuevoEstado);

        if (resultado) {
            const filtro = document.getElementById("filtro-actividad").value;
            await cargarGestionReservas(filtro);
        } else {
            alert("No se pudo cambiar el estado");
        }
    }

    // nomina: el admin elige una actividad y se ven solo sus reservas
    if (event.target.id === "filtro-actividad") {
        filtrarPorActividad(event.target.value, contenido);
    }

});

// botones de acceso rapido del inicio: hacen click en la opcion del menu
contenido.addEventListener("click", function(event) {

    const acceso = event.target.closest("[data-ir]");

    if (acceso) {
        document.getElementById(acceso.dataset.ir).click();
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

        // por si el socio ya estaba anotado en esta actividad
        const reservas = await obtenerReservas();

        const yaReservo = reservas.some((reserva) =>
            reserva.activityId === activityId &&
            reserva.userId === usuarioId &&
            reserva.estado === "confirmada"
        );

        if (yaReservo) {
            alert("Ya tenés una reserva en esta actividad");
            return;
        }

        let confirmar = confirm("¿Querés reservar esta actividad?");

        if (!confirmar) {
            return;
        }

        // fecha de hoy en formato YYYY-MM-DD (al mes y al dia les agregamos un 0 si tienen un solo numero)
        const hoy = new Date();

        let mes = hoy.getMonth() + 1;
        let dia = hoy.getDate();

        if (mes < 10) {
            mes = "0" + mes;
        }

        if (dia < 10) {
            dia = "0" + dia;
        }

        const fechaReserva = `${hoy.getFullYear()}-${mes}-${dia}`;

        let datos = {
            userId: usuarioId,
            activityId: activityId,
            fecha: fechaReserva,
            estado: "confirmada"
        };

        let reserva = await guardarReserva(datos);

        if (reserva) {
            alert("¡Reserva realizada correctamente!");
            await cargarActividades();
        } else {
            alert("No se pudo realizar la reserva");
        }
    }
});

mostrarInicio();