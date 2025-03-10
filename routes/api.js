/**
 * Rutas de API
 */
const express = require('express');
const { crearUsuario, obtenerUsuarios, eliminarUsuario, aumentarUsos, actualizarUsuario } = require('../controllers/usuarioController');
const { obtenerAccesos, obtenerEstadisticas, eliminarTodosAccesos } = require('../controllers/accesoController');

const router = express.Router();

// Rutas de usuarios
router.post('/registrar', crearUsuario);
router.get('/registrar', obtenerUsuarios);
router.delete('/registrar/:id', eliminarUsuario);
router.post('/registrar/:id/aumentar-usos', aumentarUsos);
router.put('/registrar/:id', actualizarUsuario);

// Rutas de accesos
router.get('/accesos', obtenerAccesos);
router.get('/accesos/estadisticas', obtenerEstadisticas);
router.delete('/accesos/eliminar-todos', eliminarTodosAccesos);

module.exports = router;
