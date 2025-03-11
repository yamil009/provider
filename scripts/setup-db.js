/**
 * Script para configurar la base de datos automáticamente
 * Se ejecuta después de la instalación (postinstall en package.json)
 */

require('dotenv').config();
const { sequelize } = require('../config/database');
const User = require('../models/User');
const Acceso = require('../models/Acceso');

const setupDatabase = async () => {
  try {
    console.log('Iniciando configuración automática de la base de datos...');
    
    // Sincronizar modelos con la base de datos (crear tablas si no existen)
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados correctamente.');
    
    // Verificar si existe usuario administrador, si no, crearlo
    const adminExists = await User.findOne({ where: { username: process.env.ADMIN_USERNAME || 'yamil' }});
    
    if (!adminExists) {
      const bcrypt = require('bcrypt');
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      // Obtener fecha y hora actuales con el formato correcto
      const now = new Date();
      const fechaCreacion = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const horaCreacion = now.toTimeString().split(' ')[0]; // HH:MM:SS
      
      await User.create({
        username: process.env.ADMIN_USERNAME || 'yamil',
        password: hashedPassword,
        usos: 9999,
        activo: true,
        esAdmin: true,
        fechaCreacion,
        horaCreacion
      });
      
      console.log('Usuario administrador creado correctamente.');
    } else {
      console.log('Usuario administrador ya existe, no se creará uno nuevo.');
    }
    
    console.log('Configuración de la base de datos completada con éxito.');
  } catch (error) {
    console.error('Error durante la configuración de la base de datos:', error);
    process.exit(1);
  }
};

// Ejecutar la configuración
setupDatabase();
