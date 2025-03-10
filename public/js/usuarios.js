// Variables globales
let deleteUserId = null;
let deleteModal;
let recargarUsosModal;
let recargarUsosId = null;

// Se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar elementos
  deleteModal = document.getElementById('deleteModal');
  recargarUsosModal = document.getElementById('recargarUsosModal');
  
  // Registrar eventos
  document.getElementById('registroForm').addEventListener('submit', handleRegistroSubmit);
  document.getElementById('refreshBtn').addEventListener('click', cargarUsuarios);
  document.getElementById('confirmDeleteBtn').addEventListener('click', handleDeleteConfirm);
  document.getElementById('cancelDeleteBtn').addEventListener('click', cerrarModalEliminacion);
  
  // Eventos para modal de recarga de usos
  if (document.getElementById('confirmRecargarBtn')) {
    document.getElementById('confirmRecargarBtn').addEventListener('click', handleRecargarConfirm);
  }
  if (document.getElementById('cancelRecargarBtn')) {
    document.getElementById('cancelRecargarBtn').addEventListener('click', cerrarModalRecarga);
  }
  
  // Cerrar los modales si se hace clic fuera de ellos
  window.addEventListener('click', (event) => {
    if (event.target === deleteModal) {
      cerrarModalEliminacion();
    }
    if (event.target === recargarUsosModal) {
      cerrarModalRecarga();
    }
  });
  
  // Cargar usuarios al iniciar
  cargarUsuarios();
});

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo) {
  // Eliminar alertas anteriores que puedan existir
  const alertasAnteriores = document.querySelectorAll('.alerta');
  alertasAnteriores.forEach(alerta => {
    document.body.removeChild(alerta);
  });
  
  // Crear una nueva alerta
  const alertaElement = document.createElement('div');
  alertaElement.className = `alerta alerta-${tipo}`;
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

// Función para mostrar el modal de confirmación de eliminación
function mostrarModalEliminacion(userId, username) {
  deleteUserId = userId;
  document.getElementById('deleteUserName').textContent = username;
  deleteModal.style.display = 'block';
}

// Función para cerrar el modal de eliminación
function cerrarModalEliminacion() {
  deleteModal.style.display = 'none';
  deleteUserId = null;
}

// Función para mostrar el modal de recarga de usos
function mostrarModalRecarga(userId, username) {
  recargarUsosId = userId;
  document.getElementById('recargarUserName').textContent = username;
  recargarUsosModal.style.display = 'block';
}

// Función para cerrar el modal de recarga
function cerrarModalRecarga() {
  recargarUsosModal.style.display = 'none';
  recargarUsosId = null;
}

// Manejador de confirmación de eliminación
async function handleDeleteConfirm() {
  if (!deleteUserId) return;
  
  try {
    const response = await fetch(`/api/registrar/${deleteUserId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar usuario');
    }
    
    cerrarModalEliminacion();
    mostrarAlerta('Usuario eliminado exitosamente', 'exito');
    cargarUsuarios(); // Actualizar la lista
  } catch (error) {
    mostrarAlerta(`Error: ${error.message}`, 'error');
  }
}

// Manejador de confirmación de recarga de usos
async function handleRecargarConfirm() {
  if (!recargarUsosId) return;
  
  const cantidadUsos = parseInt(document.getElementById('cantidadUsos').value);
  
  if (isNaN(cantidadUsos) || cantidadUsos <= 0) {
    mostrarAlerta('Por favor, ingrese una cantidad válida de usos', 'error');
    return;
  }
  
  try {
    const response = await fetch(`/api/registrar/${recargarUsosId}/aumentar-usos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cantidad: cantidadUsos
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al recargar usos');
    }
    
    cerrarModalRecarga();
    mostrarAlerta(data.mensaje || 'Usos recargados exitosamente', 'exito');
    cargarUsuarios(); // Actualizar la lista
  } catch (error) {
    mostrarAlerta(`Error: ${error.message}`, 'error');
  }
}

// Función para cargar usuarios desde la API
async function cargarUsuarios() {
  try {
    const response = await fetch('/api/registrar');
    if (!response.ok) {
      throw new Error('Error al cargar usuarios');
    }
    
    const usuarios = await response.json();
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = '';
    
    usuarios.forEach(usuario => {
      const row = document.createElement('tr');
      
      // Formatear fechas
      const createdDate = new Date(usuario.createdAt).toLocaleString('es-ES');
      const updatedDate = new Date(usuario.updatedAt).toLocaleString('es-ES');
      
      // Comprobar si es usuario administrador
      const esAdmin = usuario.esAdmin === true;
      
      // Personalizar la visualización de usos para usuario administrador
      // Mostrar usos como valor principal para usuarios normales
      const usos = esAdmin ? '∞' : usuario.usos;
      
      // Crear la clase para la fila del administrador
      const rowClass = esAdmin ? 'fila-admin' : '';
      row.className = rowClass;
      
      row.innerHTML = `
        <td>${usuario.id}</td>
        <td>${usuario.username}${esAdmin ? ' <span class="etiqueta-admin">Admin</span>' : ''}</td>
        <td>${usos}</td>
        <td><span class="estado ${usuario.activo ? 'activo' : 'inactivo'}">${usuario.activo ? 'Activo' : 'Inactivo'}</span></td>
        <td>${createdDate}</td>
        <td>${updatedDate}</td>
        <td>
          ${esAdmin ? 
            '<button class="boton boton-eliminar" disabled title="No se puede eliminar al administrador">Eliminar</button>' : 
            `<button class="boton boton-eliminar" data-id="${usuario.id}" data-username="${usuario.username}">Eliminar</button>
             <button class="boton boton-recargar" data-id="${usuario.id}" data-username="${usuario.username}">Recargar Usos</button>`}
        </td>
      `;
      
      tableBody.appendChild(row);
    });
    
    // Añadir eventos a los botones de eliminar (solo para usuarios no administradores)
    document.querySelectorAll('.boton-eliminar:not([disabled])').forEach(button => {
      button.addEventListener('click', () => {
        const userId = button.getAttribute('data-id');
        const username = button.getAttribute('data-username');
        mostrarModalEliminacion(userId, username);
      });
    });
    
    // Añadir eventos a los botones de recargar usos
    document.querySelectorAll('.boton-recargar').forEach(button => {
      button.addEventListener('click', () => {
        const userId = button.getAttribute('data-id');
        const username = button.getAttribute('data-username');
        mostrarModalRecarga(userId, username);
      });
    });
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('usersTableBody').innerHTML = 
      '<tr><td colspan="7" style="text-align:center;color:var(--color-peligro);">Error al cargar usuarios. Por favor, intenta más tarde.</td></tr>';
  }
}

// Manejador del envío del formulario de registro
async function handleRegistroSubmit(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const usos = parseInt(document.getElementById('usos').value);
  
  if (!username || !password || isNaN(usos)) {
    mostrarAlerta('Por favor, completa todos los campos correctamente', 'error');
    return;
  }
  
  // Deshabilitar el botón mientras se procesa
  const submitBtn = document.getElementById('submitBtn');
  const originalBtnText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Procesando...';
  
  try {
    const response = await fetch('/api/registrar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password,
        usos
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al registrar usuario');
    }
    
    // Limpiar el formulario
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('usos').value = '5';
    
    mostrarAlerta('Usuario registrado exitosamente', 'exito');
    cargarUsuarios(); // Actualizar la lista
  } catch (error) {
    mostrarAlerta(`Error: ${error.message}`, 'error');
  } finally {
    // Restaurar el botón
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }
}
