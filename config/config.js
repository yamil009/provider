/**
 * Configuración del servidor
 */
module.exports = {
  port: process.env.PORT || 3001,
  host: process.env.HOST || '0.0.0.0',
  staticFolder: 'public',
  viewsFolder: 'views'
};
