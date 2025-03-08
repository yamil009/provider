/**
 * Rutas para la gestión de usuarios
 */
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Ruta para crear un nuevo usuario
router.post('/', usuarioController.crearUsuario);

// Ruta para obtener todos los usuarios (solo para administración)
router.get('/', usuarioController.obtenerUsuarios);

// Ruta para actualizar un usuario
router.put('/:id', usuarioController.actualizarUsuario);

module.exports = router;
