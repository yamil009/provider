/**
 * Servidor principal para SIS101.js
 * Implementación modularizada
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./config/config');
const rutasIndex = require('./routes/index');
const rutasUsuarios = require('./routes/users');
const rutasAPI = require('./routes/api');
const rutasEstadisticas = require('./routes/estadisticas');
const { sincronizarDB } = require('./models');
const bodyParser = require('body-parser');

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

// Inicializar base de datos y luego iniciar el servidor
const iniciarServidor = async () => {
  try {
    // Verificar si estamos en Railway durante el despliegue
    const isRailway = !!process.env.RAILWAY_SERVICE_NAME;
    
    // Para el entorno de Railway, saltamos la verificación de conexión si estamos
    // en modo de healthcheck (para que pase la verificación inicial)
    const skipDbCheck = isRailway && process.env.RAILWAY_HEALTHCHECK === 'true';
    
    if (skipDbCheck) {
      console.log('Modo Railway Healthcheck detectado. Iniciando servidor sin verificar base de datos...');
      startServer();
      return;
    }
    
    // Sincronizar con la base de datos (no forzar recreación para mantener los usuarios)
    // Cambiar a false para evitar borrar los datos cada vez que se reinicia el servidor
    const dbSincronizada = await sincronizarDB(false);
    
    if (dbSincronizada) {
      startServer();
    } else {
      console.error('No se pudo iniciar el servidor debido a un problema con la base de datos.');
    }
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
};

// Función para iniciar el servidor HTTP
function startServer() {
  const port = process.env.PORT || config.port;
  const host = process.env.HOST || config.host;
  
  app.listen(port, host, () => {
    // Determinar la URL base real según el entorno (desarrollo o producción)
    const isProduction = process.env.NODE_ENV === 'production';
    const isRailway = !!process.env.RAILWAY_SERVICE_NAME;
    
    console.log(`Servidor iniciado en puerto ${port} y host ${host}`);
    
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
  });
}

// Iniciar el servidor
iniciarServidor();
