/**
 * Configuración principal de la aplicación
 */
module.exports = {
  // Configuración del servidor
  port: process.env.PORT || 3001,
  host: process.env.HOST || '0.0.0.0', // Cambiado a 0.0.0.0 para aceptar conexiones en producción
  staticFolder: 'public',
  viewsFolder: 'views',

  // Configuración de la base de datos
  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'user-control',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'production' ? false : console.log,
    timezone: '-04:00', // Ajusta esto según tu zona horaria
    define: {
      timestamps: false // Desactivamos timestamps por defecto
    }
  },

  // Configuración de la aplicación
  app: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3001',
    environment: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'secreto-desarrollo-temporal'
  },

  // Configuración de seguridad
  security: {
    adminUsername: process.env.ADMIN_USERNAME || 'yamil',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*']
  }
};
