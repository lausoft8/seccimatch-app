const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Acceso denegado. No hay token.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔑 TOKEN DECODIFICADO:', decoded);

    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Token inválido - usuario no existe' });
    }

    req.user = user;
    console.log('👤 USUARIO AUTENTICADO:', { id: user.id, nombre: user.nombre });
    next();
  } catch (error) {
    console.error('❌ Error en middleware auth:', error.message);
    res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = auth;