/**
 * Modelo de Acceso
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

// Definir el modelo de Acceso
const Acceso = sequelize.define('accesos', {
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
  fechaAcceso: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  horaAcceso: {
    type: DataTypes.STRING(8),
    allowNull: false
  },
  dispositivo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  navegador: {
    type: DataTypes.STRING,
    allowNull: true
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
