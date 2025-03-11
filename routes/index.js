/**
 * Rutas principales de la aplicación
 */
const express = require('express');
const router = express.Router();
const path = require('path');

// Página principal
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

module.exports = router;