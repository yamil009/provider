/**
 * Rutas de API
 */
const express = require('express');
const { crearUsuario, obtenerUsuarios, eliminarUsuario, aumentarUsos } = require('../controllers/usuarioController');
const { obtenerAccesos, obtenerEstadisticas } = require('../controllers/accesoController');

const router = express.Router();

// Rutas de usuarios
router.post('/registrar', crearUsuario);
router.get('/registrar', obtenerUsuarios);
router.delete('/registrar/:id', eliminarUsuario);
router.post('/registrar/:id/aumentar-usos', aumentarUsos);

// Rutas de accesos
router.get('/accesos', obtenerAccesos);
router.get('/accesos/estadisticas', obtenerEstadisticas);

module.exports = router;
