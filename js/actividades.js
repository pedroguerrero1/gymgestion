const URL_ACTIVIDADES = "https://6b0105ad1c637a569e52bdac.mockapi.io/api/v1/activities";

// ---- Llamadas a la API ----

export async function obtenerActividades() {

    try {
        let respuesta = await fetch(URL_ACTIVIDADES);

        if (!respuesta.ok) {
            throw new Error("Error al obtener las actividades");
        }

        let actividades = await respuesta.json();

        return actividades;

    } catch (error) {
        console.log(error);
    }

}

// Arma la tabla de actividades con los botones de cada rol
export function mostrarActividades(actividades, contenido) {

    let filas = "";

    actividades.forEach(function(actividad) {
        
        filas += `
            <tr>
                <td>${actividad.nombre}</td>
                <td>${actividad.instructor}</td>
                <td>${actividad.horario}</td>
                <td>${actividad.dias}</td>
                <td>${actividad.cupoMaximo}</td>
                
                <td>
                    <button class="btn btn-warning btn-sm btn-editar"
                        data-id="${actividad.id}"
                        data-role="admin"
                        title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>

                    <button class="btn btn-danger btn-sm btn-eliminar"
                        data-id="${actividad.id}"
                        data-role="admin"
                        title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;

    });

    contenido.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Actividades del gimnasio</h3>

                <div class="card-tools">
                    <button class="btn btn-primary" data-role="admin" id="btn-nueva-actividad">
                        <i class="fas fa-plus"></i> Nueva actividad
                    </button>
                </div>
            </div>

            

            <div class="card-body">
                <div class="table-responsive">
                <table class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Actividad</th>
                            <th>Instructor</th>
                            <th>Horario</th>
                            <th>Días</th>
                            <th>Cupo máximo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody id="tabla-actividades">
                        ${filas}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    `;
}



// Cupo maximo menos las reservas que no estan canceladas
export function calcularCuposRestantes(actividad, reservas) {

    const ocupadas = reservas.filter((reserva) =>
        reserva.activityId === actividad.id && reserva.estado !== "cancelada"
    );

    return Number(actividad.cupoMaximo) - ocupadas.length;
}


// Crea un renglon de la card con un icono y un texto
function crearDato(icono, texto) {

    const parrafo = document.createElement("p");
    parrafo.className = "mb-1";

    const i = document.createElement("i");
    i.className = `fas ${icono} mr-2 text-muted`;

    parrafo.append(i, texto);

    return parrafo;
}


// Vista del socio: una card por actividad con los cupos que quedan
export function mostrarTarjetasActividades(actividades, reservas, usuarioId, contenido) {

    const titulo = document.createElement("h3");
    titulo.className = "mb-3";
    titulo.textContent = "Actividades disponibles";

    const grilla = document.createElement("div");
    grilla.className = "grilla-actividades";

    actividades.forEach((actividad) => {

        const cupos = calcularCuposRestantes(actividad, reservas);

        const yaReservo = reservas.some((reserva) =>
            reserva.activityId === actividad.id &&
            reserva.userId === usuarioId &&
            reserva.estado === "confirmada"
        );

        const card = document.createElement("div");
        card.className = "card card-actividad";

        const header = document.createElement("div");
        header.className = "card-header";

        const nombre = document.createElement("h3");
        nombre.className = "card-title";
        nombre.textContent = actividad.nombre;

        header.append(nombre);

        const body = document.createElement("div");
        body.className = "card-body";

        body.append(
            crearDato("fa-user", actividad.instructor),
            crearDato("fa-calendar-alt", actividad.dias),
            crearDato("fa-clock", actividad.horario)
        );

        // el color de los cupos cambia segun cuantos quedan
        const lugares = document.createElement("span");
        lugares.className = "badge badge-success";
        lugares.textContent = `${cupos} lugares libres`;

        if (cupos === 1) {
            lugares.textContent = "1 lugar libre";
        }

        if (cupos <= 3) {
            lugares.className = "badge badge-warning";
        }

        if (cupos <= 0) {
            lugares.className = "badge badge-danger";
            lugares.textContent = "Sin cupo";
        }

        body.append(lugares);

        const footer = document.createElement("div");
        footer.className = "card-footer";

        const boton = document.createElement("button");
        boton.className = "btn btn-success btn-block btn-reservar";
        boton.dataset.id = actividad.id;
        boton.textContent = "Reservar";

        if (yaReservo) {
            boton.disabled = true;
            boton.className = "btn btn-secondary btn-block";
            boton.textContent = "Ya estás anotado";
        } else if (cupos <= 0) {
            boton.disabled = true;
            boton.className = "btn btn-secondary btn-block";
            boton.textContent = "Sin cupo";
        }

        footer.append(boton);

        card.append(header, body, footer);
        grilla.append(card);
    });

    contenido.replaceChildren(titulo, grilla);
}



// Formulario para crear una actividad nueva
export function mostrarFormularioActividad(contenido) {

    contenido.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Nueva actividad</h3>
            </div>

            <div class="card-body">

                <form id="form-actividad">

                    <div class="form-group">
                        <label>Nombre de la actividad</label>
                        <input type="text" class="form-control"
                            id="nombre" required>
                    </div>

                    <div class="form-group">
                        <label>Instructor</label>
                        <input type="text" class="form-control"
                            id="instructor" required>
                    </div>

                    <div class="form-group">
                        <label>Horario</label>
                        <input type="text" class="form-control"
                            id="horario" placeholder="Ej: 18:00" required>
                    </div>

                    <div class="form-group">
                        <label>Días</label>
                        <input type="text" class="form-control"
                            id="dias" placeholder="Ej: Lunes y miércoles" required>
                    </div>

                    <div class="form-group">
                        <label>Cupo máximo</label>
                        <input type="number" class="form-control"
                            id="cupoMaximo" min="1" required>
                    </div>

                    <button type="submit" class="btn btn-success">
                        Guardar actividad
                    </button>

                </form>

            </div>
        </div>
    `;

    let formulario = document.getElementById("form-actividad");

    formulario.addEventListener("submit", async function(event) {

        event.preventDefault();

        let datos = {
            nombre: document.getElementById("nombre").value,
            instructor: document.getElementById("instructor").value,
            horario: document.getElementById("horario").value,
            dias: document.getElementById("dias").value,
            cupoMaximo: Number(document.getElementById("cupoMaximo").value)
        };

        let resultado = await guardarActividad(datos);

        if (resultado) {
            alert("Actividad guardada correctamente");

            let actividades = await obtenerActividades();
            mostrarActividades(actividades, contenido);
        }

    });

}



export async function guardarActividad(datos) {

    try {
        let respuesta = await fetch(URL_ACTIVIDADES, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        if (!respuesta.ok) {
            throw new Error("Error al guardar la actividad");
        }

        return await respuesta.json();

    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function eliminarActividad(id) {

    try {
        let respuesta = await fetch(`${URL_ACTIVIDADES}/${id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            throw new Error("Error al eliminar la actividad");
        }

        return true;

    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function actualizarActividad(id, datos) {

    try {
        let respuesta = await fetch(`${URL_ACTIVIDADES}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        if (!respuesta.ok) {
            throw new Error("Error al actualizar la actividad");
        }

        return await respuesta.json();

    } catch (error) {
        console.log(error);
        return null;
    }
}

// Formulario para editar, viene cargado con los datos de la actividad
export function mostrarFormularioEdicion(actividad, contenido) {

    contenido.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Editar actividad</h3>
            </div>

            <div class="card-body">
                <form id="form-editar-actividad">

                    <div class="form-group">
                        <label>Nombre de la actividad</label>
                        <input type="text" class="form-control"
                            id="nombre" value="${actividad.nombre}" required>
                    </div>

                    <div class="form-group">
                        <label>Instructor</label>
                        <input type="text" class="form-control"
                            id="instructor" value="${actividad.instructor}" required>
                    </div>

                    <div class="form-group">
                        <label>Horario</label>
                        <input type="text" class="form-control"
                            id="horario" value="${actividad.horario}" required>
                    </div>

                    <div class="form-group">
                        <label>Días</label>
                        <input type="text" class="form-control"
                            id="dias" value="${actividad.dias}" required>
                    </div>

                    <div class="form-group">
                        <label>Cupo máximo</label>
                        <input type="number" class="form-control"
                            id="cupoMaximo" value="${actividad.cupoMaximo}" min="1" required>
                    </div>

                    <button type="submit" class="btn btn-success">
                        Guardar cambios
                    </button>

                </form>
            </div>
        </div>
    `;

    let formulario = document.getElementById("form-editar-actividad");

formulario.addEventListener("submit", async function(event) {

    event.preventDefault();

    let datos = {
        nombre: document.getElementById("nombre").value,
        instructor: document.getElementById("instructor").value,
        horario: document.getElementById("horario").value,
        dias: document.getElementById("dias").value,
        cupoMaximo: Number(document.getElementById("cupoMaximo").value)
    };

    let resultado = await actualizarActividad(actividad.id, datos);

    if (resultado) {
        alert("Actividad actualizada correctamente");

        let actividades = await obtenerActividades();
        mostrarActividades(actividades, contenido);
    }

});

}