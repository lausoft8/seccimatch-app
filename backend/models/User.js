const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/databases');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre es requerido'
      }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      msg: 'Este correo ya está registrado'
    },
    validate: {
      isEmail: {
        msg: 'Por favor ingresa un email válido'
      },
      isInstitutionalEmail(value) {
        if (!value.endsWith('@ecci.edu.co')) {
          throw new Error('Solo se permiten correos institucionales @ecci.edu.co');
        }
      }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [6, 255],
        msg: 'La contraseña debe tener al menos 6 caracteres'
      }
    }
  },
  carrera: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La carrera es requerida'
      }
    }
  },
  semestre: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'El semestre debe ser mayor a 0'
      },
      max: {
        args: [20],
        msg: 'El semestre debe ser menor a 20'
      }
    }
  },
  intereses: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'La biografía no puede exceder 500 caracteres'
      }
    }
  },
  fotoPerfil: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ''
  },
  verificado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// Método para comparar contraseñas
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;