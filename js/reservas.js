const URL_BOOKINGS = "https://6b03b8009e7cafb37dbf78ed.mockapi.io/api/v1/bookings";

import { obtenerUsuarios } from "./usuarios.js";
import { obtenerActividades } from "./actividades.js";

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
        console.log(error);
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
        console.log(error);
        return null;
    }
}

// Cuenta las reservas de la actividad y las compara con el cupo
export async function hayCupoDisponible(activityId) {

    let actividades = await obtenerActividades();
    let reservas = await obtenerReservas();

    let actividad = actividades.find(function(actividad) {
        return actividad.id === activityId;
    });

    if (!actividad) {
        return false;
    }

    // las canceladas liberan el lugar, las demas ocupan cupo
    let reservasActivas = reservas.filter(function(reserva) {
        return reserva.activityId === activityId && reserva.estado !== "cancelada";
    });

    return reservasActivas.length < Number(actividad.cupoMaximo);
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
        console.log(error);
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
            <tr>
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

                    <tbody>
                        ${filas.join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}