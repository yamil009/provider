/**
 * Configuración del servidor
 */
module.exports = {
  port: process.env.PORT || 3001,
  host: process.env.HOST || 'localhost',
  staticFolder: 'public',
  viewsFolder: 'views'
};
