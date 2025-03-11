/**
 * Servidor principal para SIS101.js
 * Implementación modularizada
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config/config');
const rutasIndex = require('./routes/index');
const rutasUsuarios = require('./routes/users');
const rutasAPI = require('./routes/api');
const rutasEstadisticas = require('./routes/estadisticas');
const { sincronizarDB } = require('./models');

// Cargar variables de entorno
require('dotenv').config();

// Determinar si estamos en Railway
const isRailway = !!process.env.RAILWAY_SERVICE_NAME;
const isProduction = process.env.NODE_ENV === 'production' || isRailway;

// Crear aplicación Express
const app = express();

// Middleware para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar CORS
app.use(cors({
  origin: config.security.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, config.staticFolder)));

// Endpoint específico para healthcheck de Railway
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Fallback para favicon.ico que suele causar errores 502
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'img', 'favicon.ico'));
});

// Middleware para manejar errores 
app.use((err, req, res, next) => {
  console.error('Error en middleware:', err);
  res.status(500).send('Error interno del servidor');
});

// Configurar rutas
app.use('/', rutasIndex);
app.use('/usuarios', rutasUsuarios);
app.use('/api', rutasAPI);
app.use('/estadisticas', rutasEstadisticas);

// Ruta de fallback para cualquier otra petición
app.use('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Determinar el puerto y host en los que escuchar
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0'; // Usar 0.0.0.0 para Railway

// Iniciar el servidor
const server = app.listen(PORT, HOST, () => {
  console.log(`Servidor iniciado en puerto ${PORT} y host ${HOST}`);
  
  if (isRailway) {
    console.log('Aplicación desplegada en Railway.');
  }
  
  console.log(`Ambiente: ${isProduction ? 'Producción' : 'Desarrollo'}`);
  
  // Después de iniciar el servidor, intentar configurar la base de datos
  configurarBaseDeDatos();
});

// Manejar cierre adecuado del servidor
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor HTTP');
  server.close(() => {
    console.log('Servidor HTTP cerrado');
  });
});

// Función para configurar la base de datos después de iniciar el servidor
async function configurarBaseDeDatos() {
  try {
    console.log('Intentando configurar la base de datos...');
    const dbSincronizada = await sincronizarDB(false);
    
    if (dbSincronizada) {
      console.log('Base de datos configurada correctamente.');
    } else {
      console.error('Advertencia: La base de datos no pudo ser configurada. Algunas funcionalidades pueden no estar disponibles.');
    }
  } catch (error) {
    console.error('Error al configurar la base de datos:', error);
    console.log('El servidor continúa en ejecución, pero algunas funcionalidades pueden no estar disponibles.');
  }
}
