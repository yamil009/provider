/**
 * Modelo de Usuario para la base de datos
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Definir el modelo de Usuario
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  usos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5, // Número predeterminado de usos
    validate: {
      min: 0
    }
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  esAdmin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'usuarios', // Especificamos explícitamente el nombre de la tabla
  timestamps: true      // Añade createdAt y updatedAt
  // Se han eliminado los hooks para permitir la administración directa de contraseñas
});

// Método para verificar contraseña (ahora compara directamente las cadenas)
User.prototype.verificarPassword = async function(passwordIngresada) {
  return passwordIngresada === this.password;
};

// Método para disminuir el número de usos
User.prototype.disminuirUsos = async function() {
  // No disminuir los usos si es un administrador
  if (this.esAdmin) {
    return true;
  }
  
  // No disminuir si ya no tiene usos disponibles
  if (this.usos <= 0) {
    return false;
  }
  
  // Disminuir usos
  this.usos -= 1;
  await this.save();
  return true;
};

// Método para verificar si aún tiene usos disponibles
User.prototype.tieneUsos = function() {
  return this.esAdmin || this.usos > 0;
};

module.exports = User;
