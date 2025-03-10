/**
 * Controlador para gestionar los accesos
 */
const { Acceso, User, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Obtener todos los accesos
 */
exports.obtenerAccesos = async (req, res) => {
  try {
    // Obtener parámetros de filtro y paginación
    const { desde, hasta, usuario, limite = 100, pagina = 1 } = req.query;
    
    // Construir opciones de consulta
    const opciones = {
      order: [['fechaAcceso', 'DESC']],
      limit: parseInt(limite),
      offset: (parseInt(pagina) - 1) * parseInt(limite),
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['username', 'esAdmin']
        }
      ]
    };
    
    // Añadir filtros si existen
    const filtros = {};
    
    if (desde || hasta) {
      filtros.fechaAcceso = {};
      if (desde) {
        filtros.fechaAcceso[Op.gte] = new Date(desde);
      }
      if (hasta) {
        filtros.fechaAcceso[Op.lte] = new Date(hasta);
      }
    }
    
    if (usuario) {
      filtros.username = usuario;
    }
    
    if (Object.keys(filtros).length > 0) {
      opciones.where = filtros;
    }
    
    // Obtener los accesos
    const accesos = await Acceso.findAll(opciones);
    
    // Obtener el total de registros para la paginación
    const total = await Acceso.count({
      where: opciones.where
    });
    
    // Devolver resultados
    return res.json({
      total,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      accesos
    });
  } catch (error) {
    console.error('Error al obtener accesos:', error);
    return res.status(500).json({ error: 'Error al obtener accesos' });
  }
};

/**
 * Obtener estadísticas de acceso
 */
exports.obtenerEstadisticas = async (req, res) => {
  try {
    // Total de accesos
    const totalAccesos = await Acceso.count();
    
    // Accesos en las últimas 24 horas
    const accesosRecientes = await Acceso.count({
      where: {
        fechaAcceso: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });
    
    // Usuarios únicos que han accedido
    const usuariosUnicos = await Acceso.count({
      distinct: true,
      col: 'userId'
    });
    
    // Top 5 usuarios con más accesos
    const topUsuarios = await Acceso.findAll({
      attributes: [
        'username',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      group: ['username'],
      order: [[sequelize.literal('total'), 'DESC']],
      limit: 5
    });
    
    // Devolver estadísticas
    return res.json({
      totalAccesos,
      accesosRecientes,
      usuariosUnicos,
      topUsuarios
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

/**
 * Eliminar todos los registros de acceso
 */
exports.eliminarTodosAccesos = async (req, res) => {
  try {
    // Eliminar todos los registros de la tabla de accesos
    await Acceso.destroy({
      where: {},
      truncate: true
    });
    
    return res.status(200).json({ 
      mensaje: 'Todos los registros de acceso han sido eliminados exitosamente',
      eliminados: true 
    });
    
  } catch (error) {
    console.error('Error al eliminar registros de acceso:', error);
    return res.status(500).json({ 
      error: 'Error al eliminar los registros de acceso',
      detalles: error.message
    });
  }
};
