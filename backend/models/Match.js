const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/databases');
const User = require('./User');

const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user1_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  user2_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'matched', 'rejected'),
    defaultValue: 'pending'
  },
  matched_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'matches',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user1_id', 'user2_id']
    }
  ]
});

// Relaciones
Match.belongsTo(User, { as: 'User1', foreignKey: 'user1_id' });
Match.belongsTo(User, { as: 'User2', foreignKey: 'user2_id' });
User.hasMany(Match, { as: 'MatchesAsUser1', foreignKey: 'user1_id' });
User.hasMany(Match, { as: 'MatchesAsUser2', foreignKey: 'user2_id' });

module.exports = Match;