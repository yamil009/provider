/**
 * Configuración del servidor
 */
module.exports = {
  port: process.env.PORT || 3001,
  host: process.env.HOST || '192.168.100.57',
  staticFolder: 'public',
  viewsFolder: 'views'
};
