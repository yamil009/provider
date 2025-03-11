/**
 * Modelo de Usuario
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('usuarios', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  usos: {
    type: DataTypes.INTEGER,
    defaultValue: 15
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  esAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Campos personalizados para fechas en lugar de timestamps automáticos
  fechaCreacion: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  horaCreacion: {
    type: DataTypes.STRING(8),
    allowNull: true
  }
}, {
  timestamps: false, // Desactivar timestamps automáticos
  tableName: 'usuarios' // Nombre explícito de la tabla
});

// Método para validar contraseña
User.prototype.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
