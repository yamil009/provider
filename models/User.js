/**
 * Modelo de Usuario para la base de datos
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

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
  totalUsos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5, // Número predeterminado de usos totales
    validate: {
      min: 0
    }
  },
  usosRestantes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5, // Inicialmente igual a totalUsos
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
  tableName: 'usuarios', // Nombre de la tabla en español
  timestamps: true,      // Añade createdAt y updatedAt
  hooks: {
    // Hashear la contraseña antes de guardar
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    // Hashear la contraseña al actualizar si ha cambiado
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Método para verificar contraseña
User.prototype.verificarPassword = async function(passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

// Método para disminuir el número de usos restantes
User.prototype.disminuirUsos = async function() {
  // Si es el usuario administrador o si tiene usos restantes
  if (this.esAdmin || this.usosRestantes > 0) {
    // Solo disminuir si no es administrador
    if (!this.esAdmin && this.usosRestantes > 0) {
      this.usosRestantes -= 1;
      await this.save();
    }
    return true;
  }
  return false;
};

// Método para verificar si aún tiene usos disponibles
User.prototype.tieneUsos = function() {
  return this.esAdmin || this.usosRestantes > 0;
};

module.exports = User;
