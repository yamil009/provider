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
const { sincronizarDB } = require('./models');
const bodyParser = require('body-parser');

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
app.use('/api/registrar', rutasUsuarios);

// Ruta para la página de gestión de usuarios
app.get('/usuarios', (req, res) => {
  res.sendFile(path.join(__dirname, config.viewsFolder, 'usuarios.html'));
});

// Inicializar base de datos y luego iniciar el servidor
const iniciarServidor = async () => {
  try {
    // Sincronizar con la base de datos (forzar recreación temporalmente para agregar la columna esAdmin)
    // IMPORTANTE: Una vez que la columna se ha creado, cambiar de nuevo a false
    const dbSincronizada = await sincronizarDB(true);
    
    if (!dbSincronizada) {
      console.warn('⚠️ Advertencia: El servidor se iniciará sin sincronización de base de datos');
    }
    
    // Iniciar el servidor
    app.listen(config.port, () => {
      console.log(`Servidor iniciado en http://localhost:${config.port}`);
      console.log(`Accede a SIS101.js en http://localhost:${config.port}/SIS101.js`);
      console.log(`API de usuarios disponible en http://localhost:${config.port}/api/registrar`);
      console.log(`Panel de administración disponible en http://localhost:${config.port}/usuarios`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
};

// Iniciar el servidor
iniciarServidor();
