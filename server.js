/**
 * Servidor principal para SIS101.js
 * Implementación modularizada
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./config/config');
const routes = require('./routes/index');
const rutasUsuarios = require('./routes/users');
const rutasAPI = require('./routes/api');
const rutasEstadisticas = require('./routes/estadisticas');
const { sincronizarDB } = require('./models');
const bodyParser = require('body-parser');

// Cargar variables de entorno
require('dotenv').config();

// Inicializar la aplicación Express
const app = express();

// Habilitar CORS para todas las rutas
app.use(cors());

// Middleware para parsear JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar carpeta de archivos estáticos
app.use(express.static(path.join(__dirname, config.staticFolder)));

// Registrar las rutas
app.use('/', routes);
app.use('/api', rutasAPI); 
app.use('/api/registrar', rutasUsuarios);
app.use('/api/estadisticas', rutasEstadisticas);

// Ruta para la página de gestión de usuarios
app.get('/usuarios', (req, res) => {
  res.sendFile(path.join(__dirname, config.viewsFolder, 'usuarios.html'));
});

// Inicializar base de datos y luego iniciar el servidor
const iniciarServidor = async () => {
  try {
    // Sincronizar con la base de datos (no forzar recreación para mantener los usuarios)
    // Cambiar a false para evitar borrar los datos cada vez que se reinicia el servidor
    const dbSincronizada = await sincronizarDB(false);
    
    if (dbSincronizada) {
      // Iniciar el servidor en el puerto configurado
      app.listen(config.port, config.host, () => {
        // Determinar la URL base real según el entorno (desarrollo o producción)
        const isProduction = process.env.NODE_ENV === 'production';
        const baseUrl = isProduction 
          ? 'La aplicación está desplegada en Railway. URL definida por Railway.' 
          : `http://${config.host === '0.0.0.0' ? 'localhost' : config.host}:${config.port}`;
        
        console.log(`Servidor en ejecución en ${baseUrl}`);
        console.log(`Accede a SIS101.js en ${baseUrl}/SIS101.js`);
        console.log(`API de usuarios disponible en ${baseUrl}/api/registrar`);
        console.log(`Panel de administración disponible en ${baseUrl}/usuarios`);
        console.log(`Historial de accesos disponible en ${baseUrl}/accesos`);
        console.log(`Ambiente: ${isProduction ? 'Producción' : 'Desarrollo'}`);
      });
    } else {
      console.error('No se pudo iniciar el servidor debido a un problema con la base de datos.');
    }
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
};

// Iniciar el servidor
iniciarServidor();
