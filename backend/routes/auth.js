const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// REGISTRO DE USUARIO
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, carrera, semestre, intereses, bio } = req.body;
    
    console.log('📝 Intentando registrar:', { nombre, email, carrera });

    // Validar correo institucional
    if (!email.endsWith('@ecci.edu.co')) {
      return res.status(400).json({ 
        error: 'Solo se permiten correos institucionales @ecci.edu.co' 
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Este correo ya está registrado' });
    }

    // Crear usuario (la contraseña se encripta automáticamente en el modelo)
    const user = await User.create({
      nombre,
      email,
      password, // Se encripta automáticamente en el hook del modelo
      carrera,
      semestre: parseInt(semestre),
      intereses: Array.isArray(intereses) ? intereses : [],
      bio: bio || '',
      verificado: true // Por ahora auto-verificado, luego con email
    });

    // Generar token
    const token = generateToken(user.id);

    res.status(201).json({
      message: '✅ Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        carrera: user.carrera,
        semestre: user.semestre,
        intereses: user.intereses,
        bio: user.bio,
        verificado: user.verificado
      }
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ 
      error: error.message || 'Error en el servidor durante el registro' 
    });
  }
});

// LOGIN DE USUARIO
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña usando el método del modelo
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    // Generar token
    const token = generateToken(user.id);

    res.json({
      message: '✅ Login exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        carrera: user.carrera,
        semestre: user.semestre,
        intereses: user.intereses,
        bio: user.bio,
        verificado: user.verificado
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor durante el login' });
  }
});

module.exports = router;