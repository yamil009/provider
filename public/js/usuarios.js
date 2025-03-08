// Variables globales
let deleteUserId = null;
let deleteModal;

// Se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar elementos
  deleteModal = document.getElementById('deleteModal');
  
  // Registrar eventos
  document.getElementById('registroForm').addEventListener('submit', handleRegistroSubmit);
  document.getElementById('refreshBtn').addEventListener('click', cargarUsuarios);
  document.getElementById('confirmDeleteBtn').addEventListener('click', handleDeleteConfirm);
  document.getElementById('cancelDeleteBtn').addEventListener('click', cerrarModalEliminacion);
  
  // Cerrar el modal si se hace clic fuera de él
  window.addEventListener('click', (event) => {
    if (event.target === deleteModal) {
      cerrarModalEliminacion();
    }
  });
  
  // Cargar usuarios al iniciar
  cargarUsuarios();
});

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo) {
  const alertContainer = document.getElementById('contenedor-alerta');
  alertContainer.innerHTML = mensaje;
  alertContainer.className = `alerta alerta-${tipo}`;
  
  // Ocultar el mensaje después de 5 segundos
  setTimeout(() => {
    alertContainer.className = 'oculto';
  }, 5000);
}

// Función para mostrar el modal de confirmación
function mostrarModalEliminacion(userId, username) {
  deleteUserId = userId;
  document.getElementById('deleteUserName').textContent = username;
  deleteModal.style.display = 'block';
}

// Función para cerrar el modal
function cerrarModalEliminacion() {
  deleteModal.style.display = 'none';
  deleteUserId = null;
}

// Función para eliminar un usuario
async function eliminarUsuario(userId) {
  try {
    const response = await fetch(`/api/registrar/${userId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Error al eliminar usuario');
    }
    
    // Recargar la tabla de usuarios
    cargarUsuarios();
    mostrarAlerta('Usuario eliminado correctamente.', 'exito');
  } catch (error) {
    console.error('Error:', error);
    mostrarAlerta(`Error: ${error.message}`, 'error');
  }
}

// Manejador de confirmación de eliminación
function handleDeleteConfirm() {
  if (deleteUserId) {
    eliminarUsuario(deleteUserId);
    cerrarModalEliminacion();
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
      const totalUsos = esAdmin ? '∞' : usuario.totalUsos;
      const usosRestantes = esAdmin ? '∞' : usuario.usosRestantes;
      
      // Crear la clase para la fila del administrador
      const rowClass = esAdmin ? 'fila-admin' : '';
      row.className = rowClass;
      
      row.innerHTML = `
        <td>${usuario.id}</td>
        <td>${usuario.username}${esAdmin ? ' <span class="etiqueta-admin">Admin</span>' : ''}</td>
        <td>${totalUsos}</td>
        <td>${usosRestantes}</td>
        <td><span class="estado ${usuario.activo ? 'activo' : 'inactivo'}">${usuario.activo ? 'Activo' : 'Inactivo'}</span></td>
        <td>${createdDate}</td>
        <td>${updatedDate}</td>
        <td>
          ${esAdmin ? 
            '<button class="boton boton-eliminar" disabled title="No se puede eliminar al administrador">Eliminar</button>' : 
            `<button class="boton boton-eliminar" data-id="${usuario.id}" data-username="${usuario.username}">Eliminar</button>`}
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
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('usersTableBody').innerHTML = 
      '<tr><td colspan="8" style="text-align:center;color:var(--color-peligro);">Error al cargar usuarios. Por favor, intenta más tarde.</td></tr>';
  }
}

// Manejador del envío del formulario de registro
async function handleRegistroSubmit(event) {
  event.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  const textoOriginal = submitBtn.textContent;
  submitBtn.textContent = 'Registrando...';
  
  try {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const totalUsos = parseInt(document.getElementById('totalUsos').value);
    
    // Verificar que no se intente crear un usuario llamado "yamil"
    if (username.toLowerCase() === 'yamil') {
      throw new Error('No se puede crear otro usuario con el nombre "yamil"');
    }
    
    const response = await fetch('/api/registrar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password, totalUsos })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al registrar usuario');
    }
    
    // Mostrar mensaje de éxito
    mostrarAlerta(`Usuario <strong>${username}</strong> registrado correctamente.`, 'exito');
    
    // Limpiar formulario
    document.getElementById('registroForm').reset();
    
    // Recargar la tabla de usuarios
    cargarUsuarios();
  } catch (error) {
    console.error('Error:', error);
    mostrarAlerta(`Error: ${error.message}`, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = textoOriginal;
  }
}
