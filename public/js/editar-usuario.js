/**
 * Funcionalidad para editar usuarios
 */

// Se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  // Los elementos ya se inicializan en usuarios.js
  
  // Registrar eventos para la edición
  document.getElementById('editForm').addEventListener('submit', handleEditSubmit);
  
  // No es necesario registrar cancelEditBtn aquí ya que se hace en usuarios.js
});

// Manejador del envío del formulario de edición
async function handleEditSubmit(event) {
  event.preventDefault();
  
  if (!editUserId) return;
  
  // Recopilar datos del formulario
  const username = document.getElementById('editUsername').value.trim();
  const password = document.getElementById('editPassword').value.trim();
  const activoTrue = document.getElementById('editActivoTrue').checked;
  const activoFalse = document.getElementById('editActivoFalse').checked;
  
  // Determinar estado según el botón de radio seleccionado
  const activo = activoTrue ? true : false;
  
  // Validaciones básicas
  if (!username) {
    mostrarAlerta('El nombre de usuario es obligatorio', 'error');
    return;
  }
  
  if (!activoTrue && !activoFalse) {
    mostrarAlerta('Debe seleccionar un estado para el usuario', 'error');
    return;
  }
  
  // Construir el objeto de datos para la actualización
  const datosActualizacion = {
    username,
    activo
  };
  
  // Solo incluir la contraseña si se ha ingresado una nueva
  if (password) {
    datosActualizacion.password = password;
  }
  
  try {
    const response = await fetch(`/api/registrar/${editUserId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosActualizacion)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar el usuario');
    }
    
    // Cerrar el modal y mostrar mensaje de éxito
    cerrarModalEdicion();
    mostrarAlerta('Usuario actualizado correctamente', 'exito');
    
    // Recargar la lista de usuarios
    cargarUsuarios();
  } catch (error) {
    mostrarAlerta(`Error: ${error.message}`, 'error');
  }
}
