/**
 * Rutas para estadísticas y visualización de datos
 */
const express = require('express');
const { Acceso } = require('../models');
const { Op, Sequelize } = require('sequelize');
const router = express.Router();

// Ruta para obtener estadísticas generales (resumen)
router.get('/resumen', async (req, res) => {
  try {
    // Total de accesos
    const totalAccesos = await Acceso.count();
    
    // Accesos recientes (últimas 24 horas)
    const fechaReciente = new Date();
    fechaReciente.setHours(fechaReciente.getHours() - 24);
    
    const accesosRecientes = await Acceso.count({
      where: {
        fechaAcceso: {
          [Op.gte]: fechaReciente
        }
      }
    });
    
    // Usuarios únicos
    const usuariosUnicos = await Acceso.count({
      distinct: true,
      col: 'username'
    });
    
    res.json({
      totalAccesos,
      accesosRecientes,
      usuariosUnicos
    });
  } catch (error) {
    console.error('Error al obtener resumen de estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Ruta para obtener accesos con paginación y filtros
router.get('/accesos', async (req, res) => {
  try {
    console.log('Solicitud recibida en /api/estadisticas/accesos');
    console.log('Query params:', req.query);
    
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 20;
    const offset = (pagina - 1) * limite;
    
    console.log(`Paginación: pagina=${pagina}, limite=${limite}, offset=${offset}`);
    
    // Construir condiciones de filtro
    const condiciones = {};
    
    if (req.query.desde || req.query.hasta) {
      condiciones.fechaAcceso = {};
      
      if (req.query.desde) {
        const desde = new Date(req.query.desde);
        desde.setHours(0, 0, 0, 0);
        condiciones.fechaAcceso[Op.gte] = desde;
      }
      
      if (req.query.hasta) {
        const hasta = new Date(req.query.hasta);
        hasta.setHours(23, 59, 59, 999);
        condiciones.fechaAcceso[Op.lte] = hasta;
      }
    }
    
    if (req.query.usuario) {
      condiciones.username = {
        [Op.like]: `%${req.query.usuario}%`
      };
    }
    
    console.log('Condiciones de filtro:', JSON.stringify(condiciones));
    
    // Obtener total de registros con los filtros aplicados
    console.log('Contando registros...');
    const total = await Acceso.count({ where: condiciones });
    console.log(`Total registros encontrados: ${total}`);
    
    // Obtener registros con paginación
    console.log('Buscando registros con paginación...');
    const accesos = await Acceso.findAll({
      where: condiciones,
      limit: limite,
      offset: offset,
      order: [['fechaAcceso', 'DESC']]
    });
    
    console.log(`Registros recuperados: ${accesos.length}`);
    
    res.json({
      total,
      pagina,
      limite,
      accesos
    });
  } catch (error) {
    console.error('Error detallado al obtener accesos:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Error al obtener accesos',
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack 
    });
  }
});

// Ruta para eliminar todos los accesos
router.delete('/accesos', async (req, res) => {
  try {
    await Acceso.destroy({ where: {} });
    
    res.json({
      success: true,
      message: 'Todos los registros de acceso han sido eliminados'
    });
  } catch (error) {
    console.error('Error al eliminar accesos:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al eliminar registros de acceso'
    });
  }
});

// Obtiene estadísticas de uso por día para un período específico
router.get('/uso-diario/:dias', async (req, res) => {
  try {
    const dias = parseInt(req.params.dias) || 7;
    
    // Calcular la fecha de inicio (días atrás desde hoy)
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias + 1);
    fechaInicio.setHours(0, 0, 0, 0);
    
    const resultado = await Acceso.findAll({
      attributes: [
        [
          // Formatear la fecha como YYYY-MM-DD para agrupar por día
          Acceso.sequelize.fn('DATE', Acceso.sequelize.col('fechaAcceso')),
          'fecha'
        ],
        [
          // Contar los registros por día
          Acceso.sequelize.fn('COUNT', Acceso.sequelize.col('id')), 
          'total'
        ]
      ],
      where: {
        fechaAcceso: {
          [Op.gte]: fechaInicio
        }
      },
      group: [Acceso.sequelize.fn('DATE', Acceso.sequelize.col('fechaAcceso'))],
      order: [[Acceso.sequelize.fn('DATE', Acceso.sequelize.col('fechaAcceso')), 'ASC']]
    });
    
    // Formatear resultados para el gráfico
    const labels = [];
    const values = [];
    
    // Crear un mapa de fechas con recuentos
    const mapaFechas = {};
    resultado.forEach(item => {
      const fecha = new Date(item.getDataValue('fecha'));
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const fechaFormateada = `${dia}/${mes}`;
      
      mapaFechas[fechaFormateada] = parseInt(item.getDataValue('total'));
    });
    
    // Asegurar que tenemos todos los días en el rango, incluso los que no tienen registros
    for (let i = 0; i < dias; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - (dias - 1) + i);
      
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const fechaFormateada = `${dia}/${mes}`;
      
      labels.push(fechaFormateada);
      values.push(mapaFechas[fechaFormateada] || 0);
    }
    
    res.json({ labels, values });
    
  } catch (error) {
    console.error('Error al obtener estadísticas de uso diario:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Obtiene los usuarios más activos (top 5 o top 10)
router.get('/usuarios-activos/:tipo', async (req, res) => {
  try {
    const tipo = req.params.tipo || 'todos';
    let limite;
    
    // Determinar el límite según el tipo seleccionado
    if (tipo === 'top5') {
      limite = 5;
    } else if (tipo === 'top10') {
      limite = 10;
    } else if (tipo === 'top20') {
      limite = 20;
    }
    // Si es 'todos', no se establece límite
    
    // Obtener la instancia de Sequelize desde el modelo
    const sequelize = Acceso.sequelize;
    
    // Configurar la consulta base
    const consultaOpciones = {
      attributes: [
        'username',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      group: ['username'],
      order: [[sequelize.literal('total'), 'DESC']]
    };
    
    // Añadir límite solo si no es 'todos'
    if (limite) {
      consultaOpciones.limit = limite;
    }
    
    // Consultar los usuarios con más accesos
    const resultado = await Acceso.findAll(consultaOpciones);
    
    // Formatear resultados para el gráfico
    const labels = [];
    const values = [];
    
    resultado.forEach(item => {
      labels.push(item.username);
      values.push(parseInt(item.getDataValue('total')));
    });
    
    res.json({ labels, values });
    
  } catch (error) {
    console.error('Error al obtener usuarios más activos:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas de usuarios' });
  }
});

module.exports = router;
