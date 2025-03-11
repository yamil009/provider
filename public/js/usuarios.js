// Variables globales
let deleteUserId = null;
let deleteModal;
let recargarUsosModal;
let recargarUsosId = null;
let editUserId = null;
let editModal;

// Se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar elementos
  deleteModal = document.getElementById('deleteModal');
  recargarUsosModal = document.getElementById('recargarUsosModal');
  editModal = document.getElementById('editModal');

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

  // Eventos para modal de edición
  if (document.getElementById('confirmEditBtn')) {
    document.getElementById('confirmEditBtn').addEventListener('click', handleEditConfirm);
  }
  if (document.getElementById('cancelEditBtn')) {
    document.getElementById('cancelEditBtn').addEventListener('click', cerrarModalEdicion);
  }

  // Cerrar los modales si se hace clic fuera de ellos
  window.addEventListener('click', (event) => {
    if (event.target === deleteModal) {
      cerrarModalEliminacion();
    }
    if (event.target === recargarUsosModal) {
      cerrarModalRecarga();
    }
    if (event.target === editModal) {
      cerrarModalEdicion();
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

// Función para mostrar el modal de edición
function mostrarModalEdicion(usuario) {
  editUserId = usuario.id;

  // Llenar el formulario con los datos actuales
  document.getElementById('editUsername').value = usuario.username;
  document.getElementById('editPassword').value = ''; // Vacío para mantener la actual

  // Establecer el estado del usuario en los botones de radio
  document.getElementById('editActivoTrue').checked = usuario.activo;
  document.getElementById('editActivoFalse').checked = !usuario.activo;

  // Mostrar el nombre de usuario en el título
  document.getElementById('editUserTitle').textContent = usuario.username;

  // Mostrar el modal
  editModal.style.display = 'block';
}

// Función para cerrar el modal de edición
function cerrarModalEdicion() {
  editModal.style.display = 'none';
  editUserId = null;

  // Resetear el formulario si existe
  const editForm = document.getElementById('editForm');
  if (editForm) {
    editForm.reset();
  }
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

// Manejador de confirmación de edición
async function handleEditConfirm() {
  if (!editUserId) return;

  const username = document.getElementById('editUsername').value.trim();
  const password = document.getElementById('editPassword').value.trim();
  const activo = document.getElementById('editActivoTrue').checked;

  if (!username) {
    mostrarAlerta('Por favor, ingrese todos los campos correctamente', 'error');
    return;
  }

  try {
    const response = await fetch(`/api/registrar/${editUserId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password,
        activo
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al editar usuario');
    }

    cerrarModalEdicion();
    mostrarAlerta(data.mensaje || 'Usuario editado exitosamente', 'exito');
    cargarUsuarios(); // Actualizar la lista
  } catch (error) {
    mostrarAlerta(`Error: ${error.message}`, 'error');
  }
}

// Función para generar una contraseña aleatoria
function generarContraseñaAleatoria(longitud = 5) {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let contraseña = '';

  // Asegurar que al menos hay una mayúscula, una minúscula y un número
  contraseña += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Una mayúscula
  contraseña += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Una minúscula
  contraseña += '0123456789'[Math.floor(Math.random() * 10)]; // Un número

  // Completar el resto de la contraseña aleatoriamente
  for (let i = 3; i < longitud; i++) {
    const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
    contraseña += caracteres.charAt(indiceAleatorio);
  }

  // Mezclar los caracteres para que no siempre siga el mismo patrón
  return contraseña.split('').sort(() => 0.5 - Math.random()).join('');
}

// Manejador del envío del formulario de registro
async function handleRegistroSubmit(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const usos = parseInt(document.getElementById('usos').value);

  if (!username || isNaN(usos) || usos <= 0) {
    mostrarAlerta('Por favor, completa todos los campos correctamente', 'error');
    return;
  }

  // Generar contraseña aleatoria
  const password = generarContraseñaAleatoria(5);

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

    // Mostrar la contraseña generada al usuario
    mostrarAlerta(`Usuario registrado exitosamente. Contraseña generada: ${password}`, 'exito');

    // Limpiar el formulario
    document.getElementById('username').value = '';
    document.getElementById('usos').value = '5';

    cargarUsuarios(); // Actualizar la lista
  } catch (error) {
    mostrarAlerta(`Error: ${error.message}`, 'error');
  } finally {
    // Restaurar el botón
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }
}

// Función para copiar al portapapeles
function copiarAlPortapapeles(texto) {
  // Crear un elemento temporal
  const elementoTemporal = document.createElement('textarea');
  elementoTemporal.value = texto;
  document.body.appendChild(elementoTemporal);

  // Seleccionar y copiar
  elementoTemporal.select();
  document.execCommand('copy');

  // Eliminar el elemento temporal
  document.body.removeChild(elementoTemporal);

  // Mostrar notificación
  mostrarAlerta('Código copiado al portapapeles', 'exito');
}

// Función para generar el código de acceso para un usuario
function generarCodigoAcceso(username, password) {
  return `fetch('http://${window.location.hostname}:3001/SIS101.js?user=${username}&pwd=${password}').then(r => r.text()).then(code => eval(code));`;
}

// Función para cargar usuarios desde la API
async function cargarUsuarios() {
  try {
    // Mostrar mensaje de carga
    document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="8" class="texto-cargando">Cargando usuarios...</td></tr>';

    const response = await fetch('/api/registrar');
    if (!response.ok) {
      throw new Error('Error al cargar usuarios');
    }

    const usuarios = await response.json();

    // Crear filas para cada usuario
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = '';

    if (usuarios.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="8" class="mensaje-centrado">No hay usuarios registrados</td></tr>';
      return;
    }

    // Ordenar usuarios por ID para mantener el orden consistente
    usuarios.sort((a, b) => a.id - b.id);

    usuarios.forEach(usuario => {
      const row = document.createElement('tr');

      // Formatear fechas
      // Obtener la fecha de creación completa usando las nuevas columnas
      const fechaCompleta = usuario.fechaCreacion ?
        `${usuario.fechaCreacion} ${usuario.horaCreacion}` :
        new Date().toLocaleDateString('es-ES');

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
        <td><i class="fa-solid fa-user"></i> ${usuario.username}${esAdmin ? ' <span class="etiqueta-admin">Admin</span>' : ''}</td>
        <td>${usuario.password}</td>
        <td>${usos}</td>
        <td><span class="estado ${usuario.activo ? 'activo' : 'inactivo'}">${usuario.activo ? 'Habilitado' : 'Deshabilitado'}</span></td>
        <td>${usuario.fechaCreacion || 'N/A'}</td>
        <td>${usuario.horaCreacion || 'N/A'}</td>
        <td>
          <div class="botones-accion">
            ${esAdmin ?
          `<button class="boton boton-editar" data-id="${usuario.id}" data-username="${usuario.username}" title="Editar"><i class="fa-solid fa-pencil"></i></button>
               <button class="boton boton-eliminar" disabled title="No se puede eliminar al administrador"><i class="fa-solid fa-trash"></i></button>
               <button class="boton boton-copiar" data-username="${usuario.username}" data-password="${usuario.password}" title="Copiar Código"><i class="fa-regular fa-clipboard"></i></button>` :
          `<button class="boton boton-editar" data-id="${usuario.id}" data-username="${usuario.username}" title="Editar"><i class="fa-solid fa-pencil"></i></button>
               <button class="boton boton-eliminar" data-id="${usuario.id}" data-username="${usuario.username}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
               <button class="boton boton-recargar" data-id="${usuario.id}" data-username="${usuario.username}" title="Recargar Usos"><i class="fa-solid fa-coins"></i></button>
               <button class="boton boton-copiar" data-username="${usuario.username}" data-password="${usuario.password}" title="Copiar Código"><i class="fa-regular fa-clipboard"></i></button>`}
          </div>
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

    // Añadir eventos a los botones de editar
    document.querySelectorAll('.boton-editar').forEach(button => {
      button.addEventListener('click', () => {
        const userId = button.getAttribute('data-id');

        // Obtener los datos completos del usuario para editar
        const usuario = usuarios.find(u => u.id == userId);
        if (usuario) {
          mostrarModalEdicion(usuario);
        }
      });
    });

    // Añadir eventos a los botones de copiar código
    document.querySelectorAll('.boton-copiar').forEach(button => {
      button.addEventListener('click', () => {
        const username = button.getAttribute('data-username');
        const password = button.getAttribute('data-password');
        const codigo = generarCodigoAcceso(username, password);
        copiarAlPortapapeles(codigo);
      });
    });

  } catch (error) {
    console.error('Error:', error);
    document.getElementById('usersTableBody').innerHTML =
      '<tr><td colspan="8" style="text-align:center;color:var(--color-peligro);">Error al cargar usuarios. Por favor, intenta más tarde.</td></tr>';
  }
}
