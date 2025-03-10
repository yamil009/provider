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
  const usos = parseInt(document.getElementById('editUsos').value);
  const activo = document.getElementById('editActivo').checked;
  
  // Validaciones básicas
  if (!username) {
    mostrarAlerta('El nombre de usuario es obligatorio', 'error');
    return;
  }
  
  if (isNaN(usos) || usos < 0) {
    mostrarAlerta('El número de usos debe ser un valor positivo o cero', 'error');
    return;
  }
  
  // Construir el objeto de datos para la actualización
  const datosActualizacion = {
    username,
    activo,
    usos
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
