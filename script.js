document.addEventListener("DOMContentLoaded", () => {
  // 🔐 Validación de contraseñas en registro
  const registroForm = document.querySelector("form[action='dashboard.html']");
  if (registroForm) {
    registroForm.addEventListener("submit", (e) => {
      const password = document.getElementById("password")?.value;
      const confirmar = document.getElementById("confirmar")?.value;

      if (password !== confirmar) {
        e.preventDefault();
        alert("Las contraseñas no coinciden.");
      }
    });
  }

  // 📊 Datos simulados para tabla de reportes
  const todosLosDatos = Array.from({ length: 36 }, (_, i) => {
    const tipos = ["temperatura", "humedad", "alimentacion", "crecimiento"];
    const tipo = tipos[i % tipos.length];
    return {
      fecha: `2025-05-${(i % 30 + 1).toString().padStart(2, '0')}`,
      tipo,
      valor:
        tipo === "temperatura" ? `${25 + (i % 5)}°C` :
        tipo === "humedad" ? `${60 + (i % 10)}%` :
        tipo === "alimentacion" ? "Automática" :
        `${1.0 + (i % 10) * 0.1} kg`,
      estado:
        tipo === "temperatura" ? "Normal" :
        tipo === "humedad" ? (i % 3 === 0 ? "Alerta" : "Normal") :
        tipo === "alimentacion" ? "Operativa" :
        "Esperado"
    };
  });

  const tablaCuerpo = document.getElementById("tabla-cuerpo");
  const paginacion = document.getElementById("paginacion");
  const filtro = document.getElementById("tipo-reporte");

  let paginaActual = 1;
  const registrosPorPagina = 10;
  let datosFiltrados = [...todosLosDatos];

  function mostrarTabla(pagina) {
    if (!tablaCuerpo) return;
    tablaCuerpo.innerHTML = "";
    const inicio = (pagina - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const datosPagina = datosFiltrados.slice(inicio, fin);

    datosPagina.forEach((fila) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${fila.fecha}</td>
        <td>${fila.tipo.charAt(0).toUpperCase() + fila.tipo.slice(1)}</td>
        <td>${fila.valor}</td>
        <td>${fila.estado}</td>
      `;
      tablaCuerpo.appendChild(tr);
    });

    generarPaginacion();
  }

  function generarPaginacion() {
    if (!paginacion) return;
    paginacion.innerHTML = "";
    const totalPaginas = Math.ceil(datosFiltrados.length / registrosPorPagina);

    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      if (i === paginaActual) btn.classList.add("active");
      btn.addEventListener("click", () => {
        paginaActual = i;
        mostrarTabla(i);
      });
      paginacion.appendChild(btn);
    }
  }

  if (filtro) {
    filtro.addEventListener("change", () => {
      const valor = filtro.value;
      datosFiltrados = valor === "todos"
        ? [...todosLosDatos]
        : todosLosDatos.filter(d => d.tipo === valor);
      paginaActual = 1;
      mostrarTabla(paginaActual);
    });

    mostrarTabla(paginaActual); // Mostrar al cargar
  }

  // 📈 Gráfico de temperatura en dashboard
  const canvasDashboard = document.getElementById("graficoTemperatura");
  if (canvasDashboard) {
    const ctx = canvasDashboard.getContext("2d");

    new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
        datasets: [{
          label: "Temperatura (°C)",
          data: [27, 28, 26, 29, 30, 28, 27],
          borderColor: "#34a853",
          backgroundColor: "rgba(52, 168, 83, 0.1)",
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }

  // 📊 Modal de gráficas en monitoreo
  const modal = document.getElementById("modalGrafico");
  const cerrar = document.querySelector(".cerrar");
  const canvasGrafico = document.getElementById("graficoSensor");
  const tituloGrafico = document.getElementById("tituloGrafico");
  const rangoSelect = document.getElementById("rango");
  let graficoActual = null;

  const datosSimulados = {
    temperatura: {
      semana: [27, 28, 29, 28, 27, 26, 27],
      mes: Array.from({ length: 30 }, () => 26 + Math.random() * 4),
      anio: Array.from({ length: 12 }, () => 26 + Math.random() * 4),
    },
    humedad: {
      semana: [65, 66, 64, 63, 62, 60, 59],
      mes: Array.from({ length: 30 }, () => 58 + Math.random() * 10),
      anio: Array.from({ length: 12 }, () => 60 + Math.random() * 10),
    },
    alimentacion: {
      semana: [1, 0, 1, 1, 1, 1, 0],
      mes: Array.from({ length: 30 }, () => Math.round(Math.random())),
      anio: Array.from({ length: 12 }, () => Math.round(Math.random())),
    },
    crecimiento: {
      semana: [1.1, 1.2, 1.3, 1.35, 1.4, 1.45, 1.5],
      mes: Array.from({ length: 30 }, (_, i) => 1.1 + i * 0.01),
      anio: Array.from({ length: 12 }, (_, i) => 1.1 + i * 0.05),
    }
  };

  document.querySelectorAll(".btn-grafico").forEach(btn => {
    btn.addEventListener("click", () => {
      const tipo = btn.dataset.sensor;
      mostrarGrafico(tipo, "semana");
    });
  });

  if (cerrar) {
    cerrar.addEventListener("click", () => {
      modal.style.display = "none";
      if (graficoActual) graficoActual.destroy();
    });
  }

  if (rangoSelect) {
    rangoSelect.addEventListener("change", () => {
      const tipo = rangoSelect.dataset.tipoSensor;
      mostrarGrafico(tipo, rangoSelect.value);
    });
  }

  function mostrarGrafico(tipoSensor, rango) {
    if (!modal || !canvasGrafico) return;

    rangoSelect.dataset.tipoSensor = tipoSensor;
    tituloGrafico.textContent = `Gráfico de ${tipoSensor.charAt(0).toUpperCase() + tipoSensor.slice(1)}`;
    modal.style.display = "block";

    const ctx = canvasGrafico.getContext("2d");
    if (graficoActual) graficoActual.destroy();

    const labels = rango === "semana"
      ? ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
      : rango === "mes"
        ? Array.from({ length: 30 }, (_, i) => `Día ${i + 1}`)
        : ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    graficoActual = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: `${tipoSensor} (${rango})`,
          data: datosSimulados[tipoSensor][rango],
          borderColor: "#34a853",
          backgroundColor: "rgba(52, 168, 83, 0.1)",
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }

  const inputFoto = document.getElementById("inputFoto");
const fotoPerfil = document.getElementById("fotoPerfil");

if (inputFoto && fotoPerfil) {
  inputFoto.addEventListener("change", (e) => {
    const archivo = e.target.files[0];
    if (archivo && archivo.type.startsWith("image/")) {
      const lector = new FileReader();
      lector.onload = function (evento) {
        fotoPerfil.src = evento.target.result;
      };
      lector.readAsDataURL(archivo);
    } else {
      alert("Por favor selecciona una imagen válida.");
    }
  });
}



});
