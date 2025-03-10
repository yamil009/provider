/**
 * Rutas para estadísticas y visualización de datos
 */
const express = require('express');
const { Acceso, Usuario } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

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
          // Nota: La sintaxis exacta puede variar según la base de datos
          // Esta es genérica y puede necesitar ajustes
          Acceso.sequelize.literal('DATE(createdAt)'), 
          'fecha'
        ],
        [
          // Contar los registros por día
          Acceso.sequelize.fn('COUNT', Acceso.sequelize.col('id')), 
          'total'
        ]
      ],
      where: {
        createdAt: {
          [Op.gte]: fechaInicio
        }
      },
      group: ['fecha'],
      order: [[Acceso.sequelize.literal('fecha'), 'ASC']]
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
    const tipo = req.params.tipo || 'top5';
    const limite = tipo === 'top5' ? 5 : 10;
    
    // Consultar los usuarios con más accesos
    const resultado = await Acceso.findAll({
      attributes: [
        'username',
        [Acceso.sequelize.fn('COUNT', Acceso.sequelize.col('id')), 'total']
      ],
      group: ['username'],
      order: [[Acceso.sequelize.literal('total'), 'DESC']],
      limit: limite
    });
    
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
