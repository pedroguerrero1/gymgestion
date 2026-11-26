const URL_BOOKINGS = "https://6b03b8009e7cafb37dbf78ed.mockapi.io/api/v1/bookings";

import { obtenerUsuarios } from "./usuarios.js";
import { obtenerActividades, calcularCuposRestantes } from "./actividades.js";

// ---- Llamadas a la API ----

export async function obtenerReservas() {

    try {
        let respuesta = await fetch(URL_BOOKINGS);

        if (!respuesta.ok) {
            throw new Error("Error al obtener las reservas");
        }

        let reservas = await respuesta.json();

        return reservas;

    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function guardarReserva(datos) {

    try {
        let respuesta = await fetch(URL_BOOKINGS, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        if (!respuesta.ok) {
            throw new Error("Error al guardar la reserva");
        }

        let reserva = await respuesta.json();

        return reserva;

    } catch (error) {
        console.error(error);
        return null;
    }
}

// Vuelve a traer los datos para que el cupo este actualizado al momento de reservar
export async function hayCupoDisponible(activityId) {

    let actividades = await obtenerActividades();
    let reservas = await obtenerReservas();

    let actividad = actividades.find(function(actividad) {
        return actividad.id === activityId;
    });

    if (!actividad) {
        return false;
    }

    return calcularCuposRestantes(actividad, reservas) > 0;
}

// Junta cada reserva con su usuario y su actividad (mockapi no tiene joins)
export async function obtenerReservasCompletas() {

    let reservas = await obtenerReservas();
    let usuarios = await obtenerUsuarios();
    let actividades = await obtenerActividades();

    let reservasCompletas = reservas.map(function(reserva) {

        let usuarioEncontrado = usuarios.find(function(usuario) {
            return usuario.id === reserva.userId;
        });

        let actividadEncontrada = actividades.find(function(actividad) {
            return actividad.id === reserva.activityId;
        });

        // si el usuario o la actividad se borraron, la reserva se sigue mostrando igual
        if (!usuarioEncontrado) {
            usuarioEncontrado = {
                id: reserva.userId,
                nombre: "Usuario eliminado"
            };
        }

        if (!actividadEncontrada) {
            actividadEncontrada = {
                id: reserva.activityId,
                nombre: "Actividad eliminada",
                dias: "-",
                horario: "-"
            };
        }

        return {
            id: reserva.id,
            usuario: usuarioEncontrado,
            actividad: actividadEncontrada,
            fecha: reserva.fecha,
            estado: reserva.estado
        };

    });

    return reservasCompletas;
}

export async function obtenerMisReservas(usuarioId) {

    let reservas = await obtenerReservasCompletas();

    let misReservas = reservas.filter(function(reserva) {
        return reserva.usuario.id === usuarioId;
    });

    return misReservas;
}


// Cambia el estado de una reserva (confirmada, cancelada o asistio)
export async function cambiarEstadoReserva(id, estado) {

    try {
        let respuesta = await fetch(`${URL_BOOKINGS}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                estado: estado
            })
        });

        if (!respuesta.ok) {
            throw new Error("Error al cambiar el estado de la reserva");
        }

        let reserva = await respuesta.json();
        return reserva;

    } catch (error) {
        console.error(error);
        return null;
    }
}


// Devuelve el estado con un color distinto segun cual sea
function mostrarEstado(estado) {

    let color = "badge-success";

    if (estado === "cancelada") {
        color = "badge-danger";
    }

    if (estado === "asistio") {
        color = "badge-info";
    }

    return `<span class="badge ${color}">${estado}</span>`;
}


// Arma la tabla de reservas, la usan el admin y el socio
export function mostrarReservas(reservas, contenido, rol) {

    let filas = reservas.map(function(reserva) {

        let acciones = "";

        if (rol === "ADMIN") {

            // el admin elige el estado desde una lista
            acciones = `
                <select class="form-control form-control-sm select-estado" data-id="${reserva.id}">
                    <option value="confirmada" ${reserva.estado === "confirmada" ? "selected" : ""}>Confirmada</option>
                    <option value="cancelada" ${reserva.estado === "cancelada" ? "selected" : ""}>Cancelada</option>
                    <option value="asistio" ${reserva.estado === "asistio" ? "selected" : ""}>Asistió</option>
                </select>
            `;

        } else if (reserva.estado === "confirmada") {

            // el socio solo puede cancelar las que siguen confirmadas
            acciones = `
                <button class="btn btn-danger btn-sm btn-cancelar-reserva"
                    data-id="${reserva.id}">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            `;
        }

        return `
            <tr data-actividad="${reserva.actividad.id}">
                <td>${reserva.usuario.nombre}</td>
                <td>${reserva.actividad.nombre}</td>
                <td>${reserva.fecha}</td>
                <td>${mostrarEstado(reserva.estado)}</td>
                <td>${acciones}</td>
            </tr>
        `;
    });

    let titulo = "Mis reservas";

    if (rol === "ADMIN") {
        titulo = "Gestión de reservas";
    }

    contenido.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">${titulo}</h3>
            </div>

            <div class="card-body">
                <div class="table-responsive">
                <table class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Actividad</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody id="tabla-reservas">
                        ${filas.join("")}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    `;
}


// Lista para que el admin vea la nomina de inscriptos de una sola actividad
export function mostrarFiltroActividades(actividades, contenido) {

    const grupo = document.createElement("div");
    grupo.className = "form-group";

    const label = document.createElement("label");
    label.textContent = "Ver inscriptos de la actividad:";

    const select = document.createElement("select");
    select.className = "form-control";
    select.id = "filtro-actividad";

    const opcionTodas = document.createElement("option");
    opcionTodas.value = "";
    opcionTodas.textContent = "Todas las actividades";
    select.append(opcionTodas);

    actividades.forEach((actividad) => {
        const opcion = document.createElement("option");
        opcion.value = actividad.id;
        opcion.textContent = `${actividad.nombre} (${actividad.dias} - ${actividad.horario})`;
        select.append(opcion);
    });

    const total = document.createElement("p");
    total.className = "text-muted";
    total.id = "total-filtro";

    grupo.append(label, select);

    contenido.querySelector(".card-body").prepend(grupo, total);
}


// Oculta las filas que no son de la actividad elegida
export function filtrarPorActividad(activityId, contenido) {

    const filas = contenido.querySelectorAll("#tabla-reservas tr");
    let visibles = 0;

    filas.forEach((fila) => {
        if (activityId === "" || fila.dataset.actividad === activityId) {
            fila.style.display = "";
            visibles++;
        } else {
            fila.style.display = "none";
        }
    });

    document.getElementById("total-filtro").textContent = `Mostrando ${visibles} reservas`;
}