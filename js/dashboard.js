import { obtenerActividades, calcularCuposRestantes } from "./actividades.js";
import { obtenerReservas } from "./reservas.js";
import { obtenerUsuarios } from "./usuarios.js";

// Panel del admin: totales arriba y dos graficos
export async function mostrarDashboard(contenido) {

    const actividades = await obtenerActividades();
    const reservas = await obtenerReservas();
    const usuarios = await obtenerUsuarios();

    const confirmadas = reservas.filter((reserva) => reserva.estado === "confirmada").length;
    const canceladas = reservas.filter((reserva) => reserva.estado === "cancelada").length;
    const asistieron = reservas.filter((reserva) => reserva.estado === "asistio").length;
    const socios = usuarios.filter((usuario) => usuario.role !== "ADMIN").length;

    contenido.innerHTML = `
        <div class="row">
            <div class="col-lg-3 col-6">
                <div class="small-box bg-info">
                    <div class="inner">
                        <h3>${reservas.length}</h3>
                        <p>Reservas totales</p>
                    </div>
                    <div class="icon"><i class="fas fa-calendar-check"></i></div>
                </div>
            </div>

            <div class="col-lg-3 col-6">
                <div class="small-box bg-success">
                    <div class="inner">
                        <h3>${confirmadas}</h3>
                        <p>Confirmadas</p>
                    </div>
                    <div class="icon"><i class="fas fa-check"></i></div>
                </div>
            </div>

            <div class="col-lg-3 col-6">
                <div class="small-box bg-danger">
                    <div class="inner">
                        <h3>${canceladas}</h3>
                        <p>Canceladas</p>
                    </div>
                    <div class="icon"><i class="fas fa-times"></i></div>
                </div>
            </div>

            <div class="col-lg-3 col-6">
                <div class="small-box bg-warning">
                    <div class="inner">
                        <h3>${socios}</h3>
                        <p>Socios registrados</p>
                    </div>
                    <div class="icon"><i class="fas fa-users"></i></div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-8">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Ocupación por actividad</h3>
                    </div>
                    <div class="card-body">
                        <div class="contenedor-grafico">
                            <canvas id="grafico-ocupacion"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Estado de las reservas</h3>
                    </div>
                    <div class="card-body">
                        <div class="contenedor-grafico">
                            <canvas id="grafico-estados"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // datos para el grafico de barras: una barra de inscriptos y otra de cupo por actividad
    const nombres = actividades.map((actividad) => actividad.nombre);
    const cupos = actividades.map((actividad) => Number(actividad.cupoMaximo));
    const inscriptos = actividades.map((actividad) =>
        Number(actividad.cupoMaximo) - calcularCuposRestantes(actividad, reservas)
    );

    new Chart(document.getElementById("grafico-ocupacion"), {
        type: "bar",
        data: {
            labels: nombres,
            datasets: [
                {
                    label: "Inscriptos",
                    data: inscriptos,
                    backgroundColor: "#007bff"
                },
                {
                    label: "Cupo máximo",
                    data: cupos,
                    backgroundColor: "#ced4da"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        precision: 0
                    }
                }]
            }
        }
    });

    // mismos colores que las etiquetas de estado de la tabla de reservas
    new Chart(document.getElementById("grafico-estados"), {
        type: "doughnut",
        data: {
            labels: ["Confirmadas", "Canceladas", "Asistió"],
            datasets: [
                {
                    data: [confirmadas, canceladas, asistieron],
                    backgroundColor: ["#28a745", "#dc3545", "#17a2b8"]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                position: "bottom"
            }
        }
    });
}