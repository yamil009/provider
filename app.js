/**
 * Servidor principal para SIS101.js
 * Implementación modularizada
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./config/config');
const rutasIndex = require('./routes/index');
const rutasUsuarios = require('./routes/usuarios');

// Cargar variables de entorno
require('dotenv').config();

// Determinar si estamos en Railway
const enRailway = !!process.env.RAILWAY_SERVICE_NAME;
const esProduccion = process.env.NODE_ENV === 'production' || enRailway;

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

// Endpoint específico para comprobación de salud de Railway
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Ruta alternativa para favicon.ico que suele causar errores 502
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

// Ruta de fallback para cualquier otra petición
app.use('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Determinar el puerto y host en los que escuchar
const PUERTO = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1'; // Usar 127.0.0.1 para desarrollo local

// Iniciar el servidor
const iniciarServidor = (puerto) => {
  const servidor = app.listen(puerto, HOST, () => {
    console.log(`Servidor iniciado en puerto ${puerto} y host ${HOST}`);
    console.log(`\n📱 Accede a la aplicación en: http://${HOST}:${puerto}\n`);

    if (enRailway) {
      console.log('Aplicación desplegada en Railway.');
    }

    console.log(`Ambiente: ${esProduccion ? 'Producción' : 'Desarrollo'}`);

    // Después de iniciar el servidor, intentar configurar la base de datos
    configurarBaseDeDatos();
  });

  // Manejar cierre adecuado del servidor
  process.on('SIGTERM', () => {
    console.log('SIGTERM recibido, cerrando servidor HTTP');
    servidor.close(() => {
      console.log('Servidor HTTP cerrado');
    });
  });

  return servidor;
};

// Intentar iniciar el servidor, probando puertos alternativos si es necesario
let servidor;
try {
  servidor = iniciarServidor(PUERTO);
} catch (error) {
  if (error.code === 'EADDRINUSE') {
    console.log(`Puerto ${PUERTO} ocupado, intentando con el puerto ${PUERTO + 1}`);
    try {
      servidor = iniciarServidor(PUERTO + 1);
    } catch (error2) {
      if (error2.code === 'EADDRINUSE') {
        console.log(`Puerto ${PUERTO + 1} también ocupado, intentando con el puerto ${PUERTO + 2}`);
        servidor = iniciarServidor(PUERTO + 2);
      } else {
        throw error2;
      }
    }
  } else {
    throw error;
  }
}

/**
 * Función para configurar la base de datos después de iniciar el servidor
 */
async function configurarBaseDeDatos() {
  try {
    const { testConnection } = require('./config/database');

    // Verificar la conexión a la base de datos
    await testConnection();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    console.log('✅ Sistema listo para usar.');

    return true;
  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error);
    return false;
  }
}
