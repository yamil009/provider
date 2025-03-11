/**
 * Modelo de Acceso para registrar el uso de SIS101.js
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

// Definir el modelo de Acceso
const Acceso = sequelize.define('Acceso', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pagina: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Desconocida'
  },
  exito: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  fechaAcceso: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  horaAcceso: {
    type: DataTypes.STRING(8),  // Formato HH:MM:SS
    allowNull: false,
    defaultValue: '00:00:00'
  },
  mensaje: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'accesos',
  timestamps: true,
  indexes: [
    {
      name: 'acceso_usuario_idx',
      fields: ['userId']
    },
    {
      name: 'acceso_fecha_idx',
      fields: ['fechaAcceso']
    },
    {
      name: 'acceso_hora_idx',
      fields: ['horaAcceso']
    }
  ]
});

// Establecer las relaciones
Acceso.belongsTo(User, { foreignKey: 'userId', as: 'usuario' });
User.hasMany(Acceso, { foreignKey: 'userId', as: 'accesos' });

module.exports = Acceso;
