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
app.use('/api', rutasAPI); 
app.use('/api/registrar', rutasUsuarios);

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
        console.log(`Servidor en ejecución en http://${config.host}:${config.port}`);
        console.log(`Accede a SIS101.js en http://${config.host}:${config.port}/SIS101.js`);
        console.log(`API de usuarios disponible en http://${config.host}:${config.port}/api/registrar`);
        console.log(`Panel de administración disponible en http://${config.host}:${config.port}/usuarios`);
        console.log(`Historial de accesos disponible en http://${config.host}:${config.port}/accesos`);
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
