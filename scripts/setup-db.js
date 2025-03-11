/**
 * Script para configurar la base de datos automáticamente
 * Se ejecuta después de la instalación (postinstall en package.json)
 */

require('dotenv').config();
const { sequelize } = require('../config/database');
const path = require('path');
const fs = require('fs');

// Función para verificar si estamos en Railway
const isRailway = () => {
  return !!process.env.RAILWAY_SERVICE_NAME;
};

const setupDatabase = async () => {
  try {
    console.log('Iniciando configuración automática de la base de datos...');
    
    // Si estamos en Railway durante el despliegue, no intentamos conectar a la base de datos
    // ya que todavía no está configurada y fallará
    if (isRailway() && process.env.npm_lifecycle_event === 'postinstall') {
      console.log('Detectado entorno Railway durante postinstall, saltando configuración de base de datos...');
      
      // Crear un archivo de marcador para indicar que el script se ha ejecutado
      const markerPath = path.join(__dirname, '..', '.railway-setup-complete');
      fs.writeFileSync(markerPath, new Date().toISOString());
      
      console.log('La base de datos se configurará cuando el servicio inicie por primera vez.');
      return;
    }
    
    // Cargar los modelos solo si no estamos en Railway durante postinstall
    const User = require('../models/User');
    const Acceso = require('../models/Acceso');
    
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
    
    // Si estamos en Railway durante postinstall, no queremos que el error detenga el despliegue
    if (isRailway() && process.env.npm_lifecycle_event === 'postinstall') {
      console.log('Error ignorado durante el despliegue en Railway.');
      process.exit(0); // Salir con éxito para no interrumpir el despliegue
    } else {
      process.exit(1);
    }
  }
};

// Ejecutar la configuración
setupDatabase();
