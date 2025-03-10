/**
 * Controlador para la gestión de usuarios
 */
const { User } = require('../models');

// Crear un nuevo usuario
exports.crearUsuario = async (req, res) => {
  try {
    const { username, password, usos = 5, esAdmin = false } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ where: { username } });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // No permitir crear otro usuario con el nombre "yamil"
    if (username.toLowerCase() === 'yamil') {
      return res.status(400).json({ error: 'No se puede crear otro usuario con el nombre "yamil"' });
    }

    // Crear el nuevo usuario
    const nuevoUsuario = await User.create({
      username,
      password,
      usos,
      esAdmin
    });

    // Responder sin incluir la contraseña
    return res.status(201).json({
      id: nuevoUsuario.id,
      username: nuevoUsuario.username,
      usos: nuevoUsuario.usos,
      activo: nuevoUsuario.activo,
      esAdmin: nuevoUsuario.esAdmin
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

// Aumentar usos de un usuario
exports.aumentarUsos = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad = 1 } = req.body;
    
    // Validar que la cantidad sea un número positivo
    const cantidadUsos = parseInt(cantidad);
    if (isNaN(cantidadUsos) || cantidadUsos <= 0) {
      return res.status(400).json({ error: 'La cantidad debe ser un número positivo' });
    }
    
    // Buscar el usuario por ID
    const usuario = await User.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // No permitir aumentar usos al administrador principal (ya tiene usos ilimitados)
    if (usuario.esAdmin) {
      return res.status(400).json({ 
        error: 'No es necesario aumentar usos a un administrador', 
        mensaje: 'Los administradores tienen usos ilimitados'
      });
    }
    
    // Aumentar los usos
    usuario.usos += cantidadUsos;
    await usuario.save();
    
    return res.status(200).json({
      success: true,
      mensaje: `Se han añadido ${cantidadUsos} usos al usuario ${usuario.username}`,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        usos: usuario.usos,
        activo: usuario.activo
      }
    });
  } catch (error) {
    console.error('Error al aumentar usos:', error);
    return res.status(500).json({ error: 'Error interno al aumentar usos' });
  }
};

// Verificar credenciales y uso de un usuario sin disminuir usos
exports.verificarUsuario = async (username, password) => {
  try {
    // Buscar el usuario por nombre de usuario
    const usuario = await User.findOne({ where: { username } });
    if (!usuario) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return { success: false, message: 'Usuario inactivo' };
    }

    // Verificar la contraseña
    const passwordCorrecto = await usuario.verificarPassword(password);
    if (!passwordCorrecto) {
      return { success: false, message: 'Contraseña incorrecta' };
    }

    // Verificar si tiene usos disponibles
    if (!usuario.tieneUsos()) {
      return { success: false, message: 'No quedan usos disponibles' };
    }

    // Si llegamos aquí, la autenticación es exitosa
    // Nota: Ya no disminuimos los usos automáticamente
    return { 
      success: true, 
      usuario: {
        id: usuario.id,
        username: usuario.username,
        usos: usuario.usos,
        esAdmin: usuario.esAdmin
      },
      // Mensajes personalizados según la situación del usuario
      message: usuario.esAdmin ? 
        '¡Bienvenido Administrador!' : 
        (usuario.usos === 1 ? 
          '¡Atención! Este es tu último uso disponible.' : 
          `Acceso correcto. Te quedan ${usuario.usos} usos.`)
    };
  } catch (error) {
    console.error('Error al verificar usuario:', error);
    return { success: false, message: 'Error interno al verificar usuario' };
  }
};

// Función específica para disminuir usos
exports.disminuirUsosUsuario = async (userId) => {
  try {
    // Buscar el usuario por ID
    const usuario = await User.findByPk(userId);
    if (!usuario) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    // Intentar disminuir los usos
    const disminuido = await usuario.disminuirUsos();
    
    if (!disminuido) {
      return { success: false, message: 'No se pudo disminuir los usos' };
    }
    
    return { 
      success: true, 
      message: 'Uso registrado correctamente',
      usos: usuario.usos
    };
  } catch (error) {
    console.error('Error al disminuir usos:', error);
    return { success: false, message: 'Error interno al disminuir usos' };
  }
};

// Obtener todos los usuarios (solo para administración)
exports.obtenerUsuarios = async (req, res) => {
  try {
    // Obtener todos los usuarios con sus datos
    const usuarios = await User.findAll({
      attributes: ['id', 'username', 'password', 'usos', 'activo', 'esAdmin', 'createdAt', 'updatedAt']
    });
    
    return res.status(200).json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({ error: 'Error al obtener la lista de usuarios' });
  }
};

// Actualizar un usuario
exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, usos, activo } = req.body;

    // Buscar el usuario
    const usuario = await User.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que no sea el administrador principal
    if (usuario.username === 'yamil') {
      // Si es yamil, solo permitir cambiar la contraseña
      if (password) {
        usuario.password = password;
        await usuario.save();
        return res.status(200).json({ 
          message: 'Contraseña de administrador actualizada',
          usuario: {
            id: usuario.id,
            username: usuario.username,
            activo: usuario.activo,
            esAdmin: usuario.esAdmin
          }
        });
      } else {
        return res.status(403).json({ error: 'No se permite modificar los datos del administrador principal' });
      }
    }

    // Actualizar campos
    if (username) usuario.username = username;
    if (password) usuario.password = password;
    if (usos !== undefined) usuario.usos = usos;
    if (activo !== undefined) usuario.activo = activo;

    // Guardar cambios
    await usuario.save();

    return res.status(200).json({
      message: 'Usuario actualizado correctamente',
      usuario: {
        id: usuario.id,
        username: usuario.username,
        usos: usuario.usos,
        activo: usuario.activo,
        esAdmin: usuario.esAdmin
      }
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

// Eliminar un usuario
exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Intento de eliminar usuario con id: ${id}`);

    // Buscar el usuario
    const usuario = await User.findByPk(id);
    if (!usuario) {
      console.log('Usuario no encontrado');
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // No permitir eliminar al administrador principal
    if (usuario.username === 'yamil') {
      console.log('Intento de eliminar al administrador principal');
      return res.status(403).json({ error: 'No se puede eliminar al administrador principal' });
    }

    // Verificar si existen registros relacionados en Acceso
    const { Acceso } = require('../models');
    const accesosRelacionados = await Acceso.count({ where: { userId: id } });
    
    if (accesosRelacionados > 0) {
      console.log(`El usuario tiene ${accesosRelacionados} accesos relacionados`);
      // Opción 1: Impedir la eliminación y notificar
      // return res.status(409).json({ 
      //   error: 'No se puede eliminar el usuario porque tiene accesos registrados' 
      // });
      
      // Opción 2: Eliminar también los accesos relacionados
      console.log('Eliminando accesos relacionados...');
      await Acceso.destroy({ where: { userId: id } });
    }

    // Eliminar el usuario
    console.log('Eliminando usuario...');
    await usuario.destroy();

    console.log('Usuario eliminado correctamente');
    return res.status(200).json({
      message: 'Usuario eliminado correctamente',
      id
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return res.status(500).json({ 
      error: 'Error al eliminar el usuario', 
      detalle: error.message 
    });
  }
};
