/**
 * Rutas para la gestión de usuarios del proveedor SIS101.js
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');
const { User } = require('../config/database');

// Ruta principal - Entrega la página de usuarios
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/usuarios.html'));
});


module.exports = router;
