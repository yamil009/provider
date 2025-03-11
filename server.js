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

// Cargar variables de entorno
require('dotenv').config();

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

// Configurar rutas
app.use('/', rutasIndex);
app.use('/usuarios', rutasUsuarios);
app.use('/api', rutasAPI);
app.use('/api/registrar', rutasUsuarios);
app.use('/api/estadisticas', rutasEstadisticas);

// Ruta para servir vistas HTML
app.get('/accesos', (req, res) => {
  res.sendFile(path.join(__dirname, config.viewsFolder, 'accesos.html'));
});

// Ruta para la página de gestión de usuarios
app.get('/usuarios', (req, res) => {
  res.sendFile(path.join(__dirname, config.viewsFolder, 'usuarios.html'));
});

// Importar módulos de base de datos
const { sincronizarDB } = require('./models');

// Iniciar el servidor primero, luego intentar conectar a la base de datos
const port = process.env.PORT || config.port;
const host = process.env.HOST || config.host;

// Iniciar el servidor HTTP inmediatamente
const server = app.listen(port, host, () => {
  console.log(`Servidor iniciado en puerto ${port} y host ${host}`);
  
  // Determinar el entorno
  const isProduction = process.env.NODE_ENV === 'production';
  const isRailway = !!process.env.RAILWAY_SERVICE_NAME;
  
  if (isRailway) {
    console.log('Aplicación desplegada en Railway.');
  } else {
    const baseUrl = `http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`;
    console.log(`Accede a SIS101.js en ${baseUrl}/SIS101.js`);
    console.log(`API de usuarios disponible en ${baseUrl}/api/registrar`);
    console.log(`Panel de administración disponible en ${baseUrl}/usuarios`);
    console.log(`Historial de accesos disponible en ${baseUrl}/accesos`);
  }
  
  console.log(`Ambiente: ${isProduction ? 'Producción' : 'Desarrollo'}`);
  
  // Después de iniciar el servidor, intentar configurar la base de datos
  configurarBaseDeDatos();
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
