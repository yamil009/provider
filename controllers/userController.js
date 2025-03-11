/**
 * Controlador para la gestión de usuarios
 */
const { User } = require('../models');

// Crear un nuevo usuario
exports.crearUsuario = async (req, res) => {
  try {
    const { username, password, totalUsos = 5 } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ where: { username } });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // Crear el nuevo usuario
    const nuevoUsuario = await User.create({
      username,
      password,
      totalUsos,
      usosRestantes: totalUsos
    });

    // Responder sin incluir la contraseña
    return res.status(201).json({
      id: nuevoUsuario.id,
      username: nuevoUsuario.username,
      totalUsos: nuevoUsuario.totalUsos,
      usosRestantes: nuevoUsuario.usosRestantes,
      activo: nuevoUsuario.activo
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

// Verificar credenciales y uso de un usuario
exports.verificarUsuario = async (username, password) => {
  try {
    // Buscar el usuario por nombre de usuario
    const usuario = await User.findOne({ where: { username } });
    if (!usuario) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    // Verificar si está activo
    if (!usuario.activo) {
      return { success: false, message: 'Usuario desactivado' };
    }

    // Verificar la contraseña
    const passwordValida = await usuario.verificarPassword(password);
    if (!passwordValida) {
      return { success: false, message: 'Contraseña incorrecta' };
    }

    // Verificar si aún tiene usos disponibles
    if (!usuario.tieneUsos()) {
      return { success: false, message: 'No quedan usos disponibles' };
    }

    // Disminuir el contador de usos
    await usuario.disminuirUsos();

    return { 
      success: true, 
      message: 'Usuario verificado correctamente',
      usosRestantes: usuario.usosRestantes 
    };
  } catch (error) {
    console.error('Error al verificar usuario:', error);
    return { success: false, message: 'Error interno al verificar el usuario' };
  }
};

// Obtener todos los usuarios (solo para administración)
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await User.findAll({
      attributes: ['id', 'username', 'totalUsos', 'usosRestantes', 'activo', 'fechaCreacion', 'horaCreacion']
    });
    return res.status(200).json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

// Actualizar un usuario
exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { totalUsos, usosRestantes, activo } = req.body;

    const usuario = await User.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Actualizar campos
    if (totalUsos !== undefined) usuario.totalUsos = totalUsos;
    if (usosRestantes !== undefined) usuario.usosRestantes = usosRestantes;
    if (activo !== undefined) usuario.activo = activo;

    await usuario.save();

    return res.status(200).json({
      id: usuario.id,
      username: usuario.username,
      totalUsos: usuario.totalUsos,
      usosRestantes: usuario.usosRestantes,
      activo: usuario.activo
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};
