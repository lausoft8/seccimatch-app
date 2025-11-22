const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/databases');
const User = require('./User');
const Match = require('./Match');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  match_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Match,
      key: 'id'
    }
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  message_type: {
    type: DataTypes.ENUM('text', 'image'),
    defaultValue: 'text'
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'messages',
  timestamps: true
});

// Relaciones
Message.belongsTo(Match, { foreignKey: 'match_id' });
Message.belongsTo(User, { as: 'Sender', foreignKey: 'sender_id' });
Match.hasMany(Message, { foreignKey: 'match_id' });
User.hasMany(Message, { as: 'SentMessages', foreignKey: 'sender_id' });

module.exports = Message;