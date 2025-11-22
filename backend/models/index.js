const User = require('./User');
const Match = require('./Match');
const Message = require('./Message');
const Post = require('./Post');
const Comment = require('./Comment'); // ← AGREGAR ESTA LÍNEA

// Exportar todos los modelos
module.exports = {
  User,
  Match, 
  Message,
  Post,
  Comment // ← AGREGAR ESTA LÍNEA
};