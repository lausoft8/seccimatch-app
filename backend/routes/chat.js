const express = require('express');
const router = express.Router();
const { User, Match, Message } = require('../models');

// MIDDLEWARE CORREGIDO - Usar en chat.js y feed.js también
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization') || req.query.token;
    
    if (!token) {
      return res.status(401).json({ error: 'Acceso no autorizado' });
    }

    // DECODIFICAR EL TOKEN PARA OBTENER EL USER ID REAL
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('🔐 TOKEN DECODIFICADO:', decoded);

    // Buscar el usuario REAL del token
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    console.log('👤 USUARIO AUTENTICADO:', { id: user.id, nombre: user.nombre });
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Error en auth middleware:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

// OBTENER CONVERSACIONES DEL USUARIO
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;

    const matches = await Match.findAll({
      where: {
        status: 'matched',
        [require('sequelize').Op.or]: [
          { user1_id: currentUser.id },
          { user2_id: currentUser.id }
        ]
      },
      include: [
        {
          model: User,
          as: 'User1',
          attributes: ['id', 'nombre', 'carrera', 'fotoPerfil']
        },
        {
          model: User,
          as: 'User2',
          attributes: ['id', 'nombre', 'carrera', 'fotoPerfil']
        },
        {
          model: Message,
          limit: 1,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    // Formatear conversaciones
    const conversations = matches.map(match => {
      const otherUser = match.user1_id === currentUser.id ? match.User2 : match.User1;
      const lastMessage = match.Messages && match.Messages[0];
      
      return {
        match_id: match.id,
        user: otherUser,
        last_message: lastMessage ? {
          content: lastMessage.content,
          is_read: lastMessage.is_read,
          created_at: lastMessage.createdAt
        } : null,
        unread_count: 0 // Por implementar
      };
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error obteniendo conversaciones:', error);
    res.status(500).json({ error: 'Error obteniendo conversaciones' });
  }
});

// OBTENER MENSAJES DE UN MATCH
router.get('/messages/:matchId', authMiddleware, async (req, res) => {
  try {
    const { matchId } = req.params;
    const currentUser = req.user;

    // Verificar que el usuario pertenece al match
    const match = await Match.findOne({
      where: {
        id: matchId,
        status: 'matched',
        [require('sequelize').Op.or]: [
          { user1_id: currentUser.id },
          { user2_id: currentUser.id }
        ]
      }
    });

    if (!match) {
      return res.status(404).json({ error: 'Conversación no encontrada' });
    }

    const messages = await Message.findAll({
      where: { match_id: matchId },
      include: [
        {
          model: User,
          as: 'Author',
          attributes: ['id', 'nombre', 'fotoPerfil']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json(messages);
  } catch (error) {
    console.error('Error obteniendo mensajes:', error);
    res.status(500).json({ error: 'Error obteniendo mensajes' });
  }
});

// ENVIAR MENSAJE
router.post('/messages/:matchId', authMiddleware, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { content } = req.body;
    const currentUser = req.user;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }

    // Verificar que el usuario pertenece al match
    const match = await Match.findOne({
      where: {
        id: matchId,
        status: 'matched',
        [require('sequelize').Op.or]: [
          { user1_id: currentUser.id },
          { user2_id: currentUser.id }
        ]
      }
    });

    if (!match) {
      return res.status(404).json({ error: 'Conversación no encontrada' });
    }

    // Crear mensaje
    const message = await Message.create({
      match_id: parseInt(matchId),
      sender_id: currentUser.id,
      content: content.trim(),
      message_type: 'text',
      is_read: false
    });

    // Obtener mensaje con datos del sender
    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'Author',
          attributes: ['id', 'nombre', 'fotoPerfil']
        }
      ]
    });

    res.status(201).json(messageWithSender);
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({ error: 'Error enviando mensaje' });
  }
});

// MARCAR MENSAJES COMO LEÍDOS
router.put('/messages/:matchId/read', authMiddleware, async (req, res) => {
  try {
    const { matchId } = req.params;
    const currentUser = req.user;

    await Message.update(
      { is_read: true },
      {
        where: {
          match_id: matchId,
          sender_id: { [require('sequelize').Op.ne]: currentUser.id },
          is_read: false
        }
      }
    );

    res.json({ message: 'Mensajes marcados como leídos' });
  } catch (error) {
    console.error('Error marcando mensajes como leídos:', error);
    res.status(500).json({ error: 'Error actualizando mensajes' });
  }
});

module.exports = router;