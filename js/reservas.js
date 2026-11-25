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

// Cuenta las reservas confirmadas de la actividad y las compara con el cupo
export async function hayCupoDisponible(activityId) {

    let actividades = await obtenerActividades();
    let reservas = await obtenerReservas();

    let actividad = actividades.find(function(actividad) {
        return actividad.id === activityId;
    });

    if (!actividad) {
        return false;
    }

    let reservasActivas = reservas.filter(function(reserva) {
        return reserva.activityId === activityId && reserva.estado === "confirmada";
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


export async function cancelarReserva(id) {

    try {
        let respuesta = await fetch(`${URL_BOOKINGS}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                estado: "cancelada"
            })
        });

        if (!respuesta.ok) {
            throw new Error("Error al cancelar la reserva");
        }

        let reserva = await respuesta.json();
        return reserva;

    } catch (error) {
        console.log(error);
        return null;
    }
}


// Arma la tabla de reservas, la usan el admin y el socio
export function mostrarReservas(reservas, contenido) {

    let filas = reservas.map(function(reserva) {

        // el boton de cancelar solo aparece si la reserva sigue confirmada
        let boton = "";

        if (reserva.estado === "confirmada") {
            boton = `
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
                <td>${reserva.estado}</td>
                <td>${boton}</td>
            </tr>
        `;
    });

    contenido.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Gestión de reservas</h3>
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