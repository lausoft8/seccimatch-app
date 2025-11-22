const express = require('express');
const router = express.Router();
const { User, Match } = require('../models');

// MIDDLEWARE: Verificar autenticación CORREGIDO
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

// OBTENER USUARIOS PARA DESCUBRIR (excluyendo matches existentes y likes enviados)
router.get('/discover', authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;

    // Obtener IDs de usuarios con los que ya hay interacción
    const existingInteractions = await Match.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { user1_id: currentUser.id },
          { user2_id: currentUser.id }
        ]
      }
    });

    const excludedUserIds = [
      currentUser.id,
      ...existingInteractions.map(match => 
        match.user1_id === currentUser.id ? match.user2_id : match.user1_id
      )
    ];

    // Obtener usuarios para descubrir
    const users = await User.findAll({
      where: {
        id: {
          [require('sequelize').Op.notIn]: excludedUserIds
        }
      },
      limit: 20,
      attributes: ['id', 'nombre', 'carrera', 'semestre', 'intereses', 'bio', 'fotoPerfil']
    });

    res.json(users);
  } catch (error) {
    console.error('Error en discover:', error);
    res.status(500).json({ error: 'Error obteniendo usuarios para descubrir' });
  }
});

// DAR LIKE A USUARIO (va a pendientes del otro)
router.post('/like/:userId', authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;
    const targetUserId = parseInt(req.params.userId);

    if (currentUser.id === targetUserId) {
      return res.status(400).json({ error: 'No puedes dar like a ti mismo' });
    }

    // Verificar si el usuario objetivo existe
    const targetUser = await User.findByPk(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si ya existe una interacción
    const existingMatch = await Match.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { user1_id: currentUser.id, user2_id: targetUserId },
          { user1_id: targetUserId, user2_id: currentUser.id }
        ]
      }
    });

    if (existingMatch) {
      return res.status(400).json({ error: 'Ya existe una interacción con este usuario' });
    }

    // Crear like pendiente (user1 da like a user2)
    await Match.create({
      user1_id: currentUser.id,
      user2_id: targetUserId,
      status: 'pending'
    });

    res.json({ 
      message: '✅ Like enviado. Espera a que te acepten.',
      match: false 
    });

  } catch (error) {
    console.error('Error en like:', error);
    res.status(500).json({ error: 'Error procesando el like' });
  }
});

// ACEPTAR LIKE PENDIENTE (crea match)
router.post('/accept/:matchId', authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;
    const matchId = parseInt(req.params.matchId);

    // Buscar el like pendiente donde currentUser es el user2 (quien recibió el like)
    const pendingLike = await Match.findOne({
      where: {
        id: matchId,
        user2_id: currentUser.id,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'User1',
          attributes: ['id', 'nombre', 'carrera', 'fotoPerfil']
        }
      ]
    });

    if (!pendingLike) {
      return res.status(404).json({ error: 'Like pendiente no encontrado' });
    }

    // Actualizar a matched
    await Match.update(
      { status: 'matched' },
      { where: { id: matchId } }
    );

    res.json({ 
      message: `🎉 ¡MATCH! Ahora estás conectado con ${pendingLike.User1.nombre}`,
      match: true,
      user: pendingLike.User1
    });

  } catch (error) {
    console.error('Error aceptando like:', error);
    res.status(500).json({ error: 'Error aceptando el like' });
  }
});

// RECHAZAR LIKE PENDIENTE
router.post('/reject/:matchId', authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;
    const matchId = parseInt(req.params.matchId);

    // Buscar y eliminar el like pendiente
    const deleted = await Match.destroy({
      where: {
        id: matchId,
        user2_id: currentUser.id,
        status: 'pending'
      }
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Like pendiente no encontrado' });
    }

    res.json({ 
      message: 'Like rechazado',
      rejected: true
    });

  } catch (error) {
    console.error('Error rechazando like:', error);
    res.status(500).json({ error: 'Error rechazando el like' });
  }
});

// OBTENER LIKES PENDIENTES (quienes me dieron like a mí)
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;

    const pendingLikes = await Match.findAll({
      where: {
        user2_id: currentUser.id,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'Initiator',
          attributes: ['id', 'nombre', 'carrera', 'semestre', 'intereses', 'bio', 'fotoPerfil']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(pendingLikes.map(match => ({
      match_id: match.id,
      user: match.User1,
      liked_at: match.createdAt
    })));
  } catch (error) {
    console.error('Error obteniendo pendientes:', error);
    res.status(500).json({ error: 'Error obteniendo likes pendientes' });
  }
});

// OBTENER MATCHES CONFIRMADOS
router.get('/my-matches', authMiddleware, async (req, res) => {
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
          as: 'Initiator',
          attributes: ['id', 'nombre', 'carrera', 'fotoPerfil']
        },
        {
          model: User,
          as: 'Receiver', 
          attributes: ['id', 'nombre', 'carrera', 'fotoPerfil']
        }
      ]
    });

    // Formatear respuesta
    const formattedMatches = matches.map(match => {
      const otherUser = match.user1_id === currentUser.id ? match.Receiver : match.Initiator;
      return {
        match_id: match.id,
        user: otherUser,
        matched_at: match.matched_at
      };
    });

    res.json(formattedMatches);
  } catch (error) {
    console.error('Error obteniendo matches:', error);
    res.status(500).json({ error: 'Error obteniendo matches' });
  }
});

module.exports = router;