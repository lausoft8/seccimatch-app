const { User, Post, Comment, Match, Message } = require('./index');

// Relaciones de User
User.hasMany(Post, { foreignKey: 'user_id' });
User.hasMany(Comment, { foreignKey: 'user_id' });
User.hasMany(Match, { as: 'InitiatedMatches', foreignKey: 'user1_id' });
User.hasMany(Match, { as: 'ReceivedMatches', foreignKey: 'user2_id' });
User.hasMany(Message, { as: 'AuthoredMessages', foreignKey: 'sender_id' }); // ← CAMBIADO

// Relaciones de Post
Post.belongsTo(User, { foreignKey: 'user_id' });
Post.hasMany(Comment, { foreignKey: 'post_id', onDelete: 'CASCADE' });

// Relaciones de Comment
Comment.belongsTo(User, { foreignKey: 'user_id' });
Comment.belongsTo(Post, { foreignKey: 'post_id' });
Comment.belongsTo(Comment, { as: 'ParentComment', foreignKey: 'parent_comment_id' });

// Relaciones de Match
Match.belongsTo(User, { as: 'Initiator', foreignKey: 'user1_id' });
Match.belongsTo(User, { as: 'Receiver', foreignKey: 'user2_id' });

// Relaciones de Message
Message.belongsTo(Match, { foreignKey: 'match_id' });
Message.belongsTo(User, { as: 'Author', foreignKey: 'sender_id' }); // ← CAMBIADO

console.log('✅ Relaciones entre modelos establecidas');