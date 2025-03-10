// Variables globales
let paginaActual = 1;
let limitePorPagina = 20;
let totalRegistros = 0;
let filtros = {};
let graficoUsoDiario;
let graficoUsuariosActivos;

// Cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar los handlers de eventos
  document.getElementById('btnFiltrar').addEventListener('click', aplicarFiltros);
  document.getElementById('btnLimpiar').addEventListener('click', limpiarFiltros);
  document.getElementById('btnAnterior').addEventListener('click', () => cambiarPagina(paginaActual - 1));
  document.getElementById('btnSiguiente').addEventListener('click', () => cambiarPagina(paginaActual + 1));
  
  // Inicializar controladores para los gráficos
  inicializarControlesGraficos();
  
  // Cargar datos iniciales
  cargarEstadisticas();
  cargarAccesos();
  cargarDatosGraficos('7'); // Cargar gráfico de uso para 7 días por defecto
  cargarDatosUsuariosActivos('top5'); // Cargar top 5 usuarios por defecto
});

// Función para inicializar los controladores de los botones de los gráficos
function inicializarControlesGraficos() {
  // Configurar botones para el gráfico de uso diario
  const botonesPeriodo = document.querySelectorAll('.periodo-btn[data-periodo]');
  botonesPeriodo.forEach(boton => {
    boton.addEventListener('click', (e) => {
      const periodo = e.target.getAttribute('data-periodo');
      const contenedor = e.target.closest('.grafico-container');
      
      // Actualizar estado activo de los botones
      contenedor.querySelectorAll('.periodo-btn').forEach(btn => {
        btn.classList.remove('activo');
      });
      e.target.classList.add('activo');
      
      // Cargar los datos según el gráfico
      if (contenedor.querySelector('#graficoUsoDiario')) {
        cargarDatosGraficos(periodo);
      } else if (contenedor.querySelector('#graficoUsuariosActivos')) {
        cargarDatosUsuariosActivos(periodo);
      }
    });
  });
}

// Función para cargar las estadísticas generales
async function cargarEstadisticas() {
  try {
    const response = await fetch('/api/accesos/estadisticas');
    if (!response.ok) {
      throw new Error('Error al cargar estadísticas');
    }
    
    const data = await response.json();
    
    // Actualizar los indicadores en la UI
    document.getElementById('totalAccesos').textContent = formatearNumero(data.totalAccesos);
    document.getElementById('accesosRecientes').textContent = formatearNumero(data.accesosRecientes);
    document.getElementById('usuariosUnicos').textContent = formatearNumero(data.usuariosUnicos);
    
  } catch (error) {
    console.error('Error:', error);
    mostrarError('No se pudieron cargar las estadísticas');
  }
}

// Función para cargar los datos del gráfico de uso diario
async function cargarDatosGraficos(dias) {
  try {
    // Llamar a la API para obtener datos reales
    const response = await fetch(`/api/estadisticas/uso-diario/${dias}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar datos del gráfico');
    }
    
    const datos = await response.json();
    
    actualizarGraficoUsoDiario(datos);
  } catch (error) {
    console.error('Error al cargar datos para el gráfico:', error);
    mostrarError('No se pudieron cargar los datos del gráfico');
  }
}

// Función para cargar los datos de usuarios más activos
async function cargarDatosUsuariosActivos(tipo) {
  try {
    // Llamar a la API para obtener datos reales
    const response = await fetch(`/api/estadisticas/usuarios-activos/${tipo}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar datos de usuarios activos');
    }
    
    const datos = await response.json();
    
    actualizarGraficoUsuariosActivos(datos);
  } catch (error) {
    console.error('Error al cargar datos de usuarios activos:', error);
    mostrarError('No se pudieron cargar los datos de usuarios activos');
  }
}

// Función para actualizar el gráfico de uso diario
function actualizarGraficoUsoDiario(datos) {
  const ctx = document.getElementById('graficoUsoDiario').getContext('2d');
  
  // Si ya existe un gráfico, destruirlo antes de crear uno nuevo
  if (graficoUsoDiario) {
    graficoUsoDiario.destroy();
  }
  
  // Crear opciones con tema oscuro para que coincida con nuestro diseño
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ecf0f1'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 15, 25, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ecf0f1',
        borderColor: 'rgba(133, 59, 206, 0.3)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(133, 59, 206, 0.1)'
        },
        ticks: {
          color: '#b8b8b8'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(133, 59, 206, 0.1)'
        },
        ticks: {
          color: '#b8b8b8'
        }
      }
    }
  };
  
  graficoUsoDiario = new Chart(ctx, {
    type: 'line',
    data: {
      labels: datos.labels,
      datasets: [{
        label: 'Accesos',
        data: datos.values,
        backgroundColor: 'rgba(133, 59, 206, 0.2)',
        borderColor: '#853BCE',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }]
    },
    options: options
  });
}

// Función para actualizar el gráfico de usuarios más activos
function actualizarGraficoUsuariosActivos(datos) {
  const ctx = document.getElementById('graficoUsuariosActivos').getContext('2d');
  
  // Si ya existe un gráfico, destruirlo antes de crear uno nuevo
  if (graficoUsuariosActivos) {
    graficoUsuariosActivos.destroy();
  }
  
  // Crear opciones con tema oscuro para que coincida con nuestro diseño
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 15, 25, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ecf0f1',
        borderColor: 'rgba(158, 34, 114, 0.3)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(158, 34, 114, 0.1)'
        },
        ticks: {
          color: '#b8b8b8'
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          color: '#ecf0f1'
        }
      }
    }
  };
  
  graficoUsuariosActivos = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: datos.labels,
      datasets: [{
        label: 'Accesos',
        data: datos.values,
        backgroundColor: '#9E2272',
        borderColor: 'rgba(158, 34, 114, 0.8)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: options
  });
}

// Función para cargar los accesos con paginación y filtros
async function cargarAccesos() {
  try {
    // Construir URL con parámetros
    let url = `/api/accesos?pagina=${paginaActual}&limite=${limitePorPagina}`;
    
    // Añadir filtros si existen
    if (filtros.desde) url += `&desde=${filtros.desde}`;
    if (filtros.hasta) url += `&hasta=${filtros.hasta}`;
    if (filtros.usuario) url += `&usuario=${filtros.usuario}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error al cargar accesos');
    }
    
    const data = await response.json();
    totalRegistros = data.total;
    
    // Actualizar la UI con los datos
    renderizarTablaAccesos(data.accesos);
    actualizarInfoPaginacion(data.pagina, data.limite, data.total);
    actualizarControlesPaginacion(data.pagina, data.limite, data.total);
    
  } catch (error) {
    console.error('Error:', error);
    mostrarError('No se pudieron cargar los accesos');
  }
}

// Función para renderizar la tabla de accesos
function renderizarTablaAccesos(accesos) {
  const tbody = document.getElementById('accesosTableBody');
  tbody.innerHTML = '';
  
  if (accesos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay registros de acceso</td></tr>';
    return;
  }
  
  accesos.forEach(acceso => {
    const row = document.createElement('tr');
    
    // Formatear la fecha para mejor legibilidad
    const fecha = new Date(acceso.fechaAcceso).toLocaleString('es-ES');
    
    // Determinar si fue exitoso o no
    const estadoClase = acceso.exito ? 'exito' : 'fallo';
    const estadoTexto = acceso.exito ? 'Exitoso' : 'Fallido';
    
    // Truncar la página si es demasiado larga
    const paginaUrl = acceso.pagina || 'Desconocida';
    const pagina = paginaUrl.length > 50 
      ? paginaUrl.substring(0, 50) + '...' 
      : paginaUrl;
    
    row.innerHTML = `
      <td>${acceso.id}</td>
      <td>${acceso.username}</td>
      <td>${acceso.ipAddress}</td>
      <td>${fecha}</td>
      <td><span class="estado-acceso ${estadoClase}">${estadoTexto}</span></td>
      <td title="${paginaUrl}">${pagina}</td>
    `;
    
    tbody.appendChild(row);
  });
}

// Función para actualizar la información de paginación
function actualizarInfoPaginacion(pagina, limite, total) {
  const inicio = (pagina - 1) * limite + 1;
  const fin = Math.min(pagina * limite, total);
  const mostrados = total > 0 ? `${inicio}-${fin}` : '0';
  
  document.getElementById('registrosMostrados').textContent = mostrados;
  document.getElementById('totalRegistros').textContent = total;
}

// Función para actualizar los controles de paginación
function actualizarControlesPaginacion(pagina, limite, total) {
  const btnAnterior = document.getElementById('btnAnterior');
  const btnSiguiente = document.getElementById('btnSiguiente');
  
  btnAnterior.disabled = pagina <= 1;
  btnSiguiente.disabled = pagina * limite >= total;
}

// Función para cambiar de página
function cambiarPagina(nuevaPagina) {
  if (nuevaPagina < 1 || nuevaPagina > Math.ceil(totalRegistros / limitePorPagina)) {
    return;
  }
  
  paginaActual = nuevaPagina;
  cargarAccesos();
}

// Aplicar filtros desde el formulario
function aplicarFiltros() {
  const desde = document.getElementById('desde').value;
  const hasta = document.getElementById('hasta').value;
  const usuario = document.getElementById('usuario').value.trim();
  
  filtros = {};
  if (desde) filtros.desde = desde;
  if (hasta) filtros.hasta = hasta;
  if (usuario) filtros.usuario = usuario;
  
  paginaActual = 1; // Reiniciar a la primera página
  cargarAccesos();
}

// Limpiar todos los filtros
function limpiarFiltros() {
  document.getElementById('desde').value = '';
  document.getElementById('hasta').value = '';
  document.getElementById('usuario').value = '';
  
  filtros = {};
  paginaActual = 1;
  cargarAccesos();
}

// Utilidades
function formatearNumero(numero) {
  return new Intl.NumberFormat('es-ES').format(numero);
}

function mostrarError(mensaje) {
  // Eliminar alertas anteriores que puedan existir
  const alertasAnteriores = document.querySelectorAll('.alerta');
  alertasAnteriores.forEach(alerta => {
    document.body.removeChild(alerta);
  });
  
  // Crear una nueva alerta
  const alertaElement = document.createElement('div');
  alertaElement.className = `alerta alerta-error`;
  alertaElement.innerHTML = mensaje;
  
  // Añadir al body en lugar de usar el contenedor
  document.body.appendChild(alertaElement);
  
  // Ocultar el mensaje después de 5 segundos (aunque la animación lo hará)
  setTimeout(() => {
    if (alertaElement.parentNode) {
      document.body.removeChild(alertaElement);
    }
  }, 5000);
}

function mostrarExito(mensaje) {
  // Eliminar alertas anteriores que puedan existir
  const alertasAnteriores = document.querySelectorAll('.alerta');
  alertasAnteriores.forEach(alerta => {
    document.body.removeChild(alerta);
  });
  
  // Crear una nueva alerta
  const alertaElement = document.createElement('div');
  alertaElement.className = `alerta alerta-exito`;
  alertaElement.innerHTML = mensaje;
  
  // Añadir al body en lugar de usar el contenedor
  document.body.appendChild(alertaElement);
  
  // Ocultar el mensaje después de 5 segundos (aunque la animación lo hará)
  setTimeout(() => {
    if (alertaElement.parentNode) {
      document.body.removeChild(alertaElement);
    }
  }, 5000);
}
