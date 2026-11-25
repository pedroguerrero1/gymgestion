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

                    <button class="btn btn-success btn-sm btn-reservar"
                        data-id="${actividad.id}"
                        data-role="user">
                        <i class="fas fa-calendar-check"></i> Reservar
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
    `;
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

