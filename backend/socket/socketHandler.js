const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, Message, Match } = require('../models');

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Middleware de autenticación para sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user.id;
      socket.userName = user.nombre;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Usuario conectado:', socket.userName, `(ID: ${socket.userId})`);

    // Unir al usuario a una sala de chat específica
    socket.on('join_chat', (matchId) => {
      socket.join(`match_${matchId}`);
      console.log(`💬 Usuario ${socket.userName} unido a chat: match_${matchId}`);
    });

    // Manejar mensajes en tiempo real
    socket.on('send_message', async (data) => {
      try {
        const { matchId, content } = data;
        
        console.log('📨 Mensaje recibido:', {
          from: socket.userName,
          matchId: matchId,
          content: content
        });

        // Verificar que el usuario pertenece al match
        const match = await Match.findOne({
          where: {
            id: matchId,
            status: 'matched',
            [require('sequelize').Op.or]: [
              { user1_id: socket.userId },
              { user2_id: socket.userId }
            ]
          }
        });

        if (!match) {
          socket.emit('error', { message: 'No tienes acceso a este chat' });
          return;
        }

        // Guardar mensaje en la base de datos
        const message = await Message.create({
          match_id: matchId,
          sender_id: socket.userId,
          content: content.trim(),
          message_type: 'text',
          is_read: false
        });

        // Obtener mensaje con datos del usuario
        const messageWithUser = await Message.findByPk(message.id, {
          include: [
            {
              model: User,
              as: 'Author',
              attributes: ['id', 'nombre', 'fotoPerfil']
            }
          ]
        });

        // Emitir mensaje a todos en la sala del chat
        io.to(`match_${matchId}`).emit('new_message', messageWithUser);
        
        console.log('✅ Mensaje enviado y guardado:', message.id);

      } catch (error) {
        console.error('❌ Error enviando mensaje:', error);
        socket.emit('error', { message: 'Error enviando mensaje' });
      }
    });

    // Manejar typing indicators
    socket.on('typing_start', (matchId) => {
      socket.to(`match_${matchId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userName
      });
    });

    socket.on('typing_stop', (matchId) => {
      socket.to(`match_${matchId}`).emit('user_stop_typing', {
        userId: socket.userId
      });
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
      console.log('🔌 Usuario desconectado:', socket.userName);
    });
  });

  return io;
};

module.exports = { configureSocket };