const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/databases');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El comentario no puede estar vacío'
      },
      len: {
        args: [1, 500],
        msg: 'El comentario debe tener entre 1 y 500 caracteres'
      }
    }
  },
  parent_comment_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'comments',
  timestamps: true
});

module.exports = Comment;