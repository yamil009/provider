// Variables globales
let paginaActual = 1;
let limitePorPagina = 20;
let totalRegistros = 0;
let filtros = {};

// Cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar los handlers de eventos
  document.getElementById('btnFiltrar').addEventListener('click', aplicarFiltros);
  document.getElementById('btnLimpiar').addEventListener('click', limpiarFiltros);
  document.getElementById('btnAnterior').addEventListener('click', () => cambiarPagina(paginaActual - 1));
  document.getElementById('btnSiguiente').addEventListener('click', () => cambiarPagina(paginaActual + 1));
  
  // Cargar datos iniciales
  cargarEstadisticas();
  cargarAccesos();
});

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
    
    // Truncar el user agent para que no sea demasiado largo
    const userAgent = acceso.userAgent.length > 50 
      ? acceso.userAgent.substring(0, 50) + '...' 
      : acceso.userAgent;
    
    row.innerHTML = `
      <td>${acceso.id}</td>
      <td>${acceso.username}</td>
      <td>${acceso.ipAddress}</td>
      <td>${fecha}</td>
      <td><span class="estado-acceso ${estadoClase}">${estadoTexto}</span></td>
      <td title="${acceso.userAgent}">${userAgent}</td>
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
