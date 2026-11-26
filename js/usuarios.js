const URL_USERS = "https://6b0105ad1c637a569e52bdac.mockapi.io/api/v1/users";

// ---- Llamadas a la API ----

export async function obtenerUsuarios() {

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

// Tabla de usuarios (solo la ve el admin)
export function mostrarUsuarios(usuarios, contenido) {

    let filas = "";

    usuarios.forEach(function(usuario) {

        filas += `
            <tr>
                <td>${usuario.nombre}</td>
                <td>${usuario.email}</td>
                <td>${usuario.role}</td>

                <td>
                    <button class="btn btn-warning btn-sm btn-editar-usuario"
                        data-id="${usuario.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>

                    <button class="btn btn-danger btn-sm btn-eliminar-usuario"
                        data-id="${usuario.id}" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;

    });

    contenido.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Usuarios del gimnasio</h3>

                <div class="card-tools">
                    <button class="btn btn-primary" id="btn-nuevo-usuario">
                        <i class="fas fa-plus"></i> Nuevo usuario
                    </button>
                </div>
            </div>

            <div class="card-body">
                <div class="table-responsive">
                <table class="table table-bordered table-striped">

                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${filas}
                    </tbody>

                </table>
                </div>
            </div>
        </div>
    `;
}

export async function guardarUsuario(datos) {

    try {
        let respuesta = await fetch(URL_USERS, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        if (!respuesta.ok) {
            throw new Error("Error al guardar el usuario");
        }

        let usuario = await respuesta.json();
        return usuario;

    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function actualizarUsuario(id, datos) {

    try {
        let respuesta = await fetch(`${URL_USERS}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        if (!respuesta.ok) {
            throw new Error("Error al actualizar el usuario");
        }

        let usuario = await respuesta.json();
        return usuario;

    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function eliminarUsuario(id) {

    try {
        let respuesta = await fetch(`${URL_USERS}/${id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            throw new Error("Error al eliminar el usuario");
        }

        return true;

    } catch (error) {
        console.error(error);
        return false;
    }
}


// Formulario para que el admin cree usuarios
export function mostrarFormularioUsuario(contenido) {

    contenido.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Nuevo usuario</h3>
            </div>

            <div class="card-body">

                <form id="form-usuario">

                    <div class="form-group">
                        <label>Nombre</label>
                        <input type="text" class="form-control"
                            id="nombre" required>
                    </div>

                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" class="form-control"
                            id="email" required>
                    </div>

                    <div class="form-group">
                        <label>Contraseña</label>
                        <input type="password" class="form-control"
                            id="password" required>
                    </div>

                    <div class="form-group">
                        <label>Rol</label>
                        <select class="form-control" id="role" required>
                            <option value="">Seleccionar rol</option>
                            <option value="USUARIO">USUARIO</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </div>

                    <button type="submit" class="btn btn-success">
                        Guardar usuario
                    </button>

                </form>

            </div>
        </div>
    `;

        let formulario = document.getElementById("form-usuario");

    formulario.addEventListener("submit", async function(event) {

        event.preventDefault();

        let datos = {
            nombre: document.getElementById("nombre").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            role: document.getElementById("role").value
        };

        let usuarioGuardado = await guardarUsuario(datos);

        if (usuarioGuardado) {
            alert("Usuario creado correctamente");

            let usuarios = await obtenerUsuarios();
            mostrarUsuarios(usuarios, contenido);
        }

    });
}


// Formulario para editar un usuario, desde aca el admin le cambia la password
export function mostrarFormularioEdicionUsuario(usuario, contenido) {

    contenido.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Editar usuario</h3>
            </div>

            <div class="card-body">

                <form id="form-editar-usuario">

                    <div class="form-group">
                        <label>Nombre</label>
                        <input type="text" class="form-control"
                            id="nombre" value="${usuario.nombre}" required>
                    </div>

                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" class="form-control"
                            id="email" value="${usuario.email}" required>
                    </div>

                    <div class="form-group">
                        <label>Contraseña</label>
                        <input type="password" class="form-control"
                            id="password" value="${usuario.password}" required>
                    </div>

                    <div class="form-group">
                        <label>Rol</label>
                        <select class="form-control" id="role" required>
                            <option value="USUARIO" ${usuario.role === "USUARIO" ? "selected" : ""}>USUARIO</option>
                            <option value="ADMIN" ${usuario.role === "ADMIN" ? "selected" : ""}>ADMIN</option>
                        </select>
                    </div>

                    <button type="submit" class="btn btn-success">
                        Guardar cambios
                    </button>

                </form>

            </div>
        </div>
    `;

        let formulario = document.getElementById("form-editar-usuario");

    formulario.addEventListener("submit", async function(event) {

        event.preventDefault();

        let datos = {
            nombre: document.getElementById("nombre").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            role: document.getElementById("role").value
        };

        let usuarioActualizado = await actualizarUsuario(usuario.id, datos);

        if (usuarioActualizado) {
            alert("Usuario actualizado correctamente");

            let usuarios = await obtenerUsuarios();
            mostrarUsuarios(usuarios, contenido);
        }

    });
}