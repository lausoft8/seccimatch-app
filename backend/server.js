const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/databases');
const { configureSocket } = require('./socket/socketHandler');
require('dotenv').config();

// Conectar a la base de datos MySQL
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : 'http://localhost:3000',
  credentials: true
}));

// Importar modelos de MySQL
const { User, Match, Message, Post, Comment } = require('./models');

// Rutas de API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/feed', require('./routes/feed'));
app.use('/api/matches', require('./routes/matches'));

// Ruta de prueba MEJORADA
app.get('/', (req, res) => {
  res.json({ 
    message: '🎯 ¡SECCImatch ahora con MySQL y WebSockets!',
    status: 'Base de datos MySQL conectada ✅',
    tecnologia: 'MySQL 8.0 + Sequelize + Socket.IO',
    fecha: new Date().toLocaleString()
  });
});

// Ruta para obtener usuarios desde MySQL
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error obteniendo usuarios de MySQL' });
  }
});

// Ruta GET temporal para crear usuario de prueba EN MYSQL
app.get('/api/create-test-user', async (req, res) => {
  try {
    const testUser = await User.create({
      nombre: 'Laura Gómez',
      email: 'laura.gomez@ecci.edu.co',
      password: 'password123',
      carrera: 'Ingeniería de Sistemas',
      semestre: 5,
      intereses: ['tecnología', 'música', 'senderismo'],
      bio: 'Estudiante de ingeniería apasionada por la tecnología y la naturaleza.',
      verificado: true
    });

    res.json({ 
      message: '✅ Usuario de prueba creado en MySQL!',
      user: testUser 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para crear usuarios frescos
app.get('/api/create-fresh-users', async (req, res) => {
  try {
    const { Match } = require('./models');
    await Match.destroy({ where: {} });

    const freshUsers = [
      {
        nombre: 'Carlos Martínez',
        email: 'carlos.martinez@ecci.edu.co',
        password: '123456',
        carrera: 'Ingeniería Mecánica',
        semestre: 4,
        intereses: ['deportes', 'música', 'tecnología'],
        bio: 'Apasionado por los deportes y la ingeniería'
      },
      {
        nombre: 'Laura Silva',
        email: 'laura.silva@ecci.edu.co',
        password: '123456', 
        carrera: 'Psicología',
        semestre: 3,
        intereses: ['libros', 'yoga', 'naturaleza'],
        bio: 'Me encanta conocer nuevas personas'
      }
    ];

    const createdUsers = [];
    for (const userData of freshUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }

    res.json({ 
      message: `✅ ${createdUsers.length} usuarios frescos creados`,
      users: createdUsers 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta temporal para resetear contraseña
app.get('/api/reset-password', async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: 'juan.perez@ecci.edu.co' } });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.password = '123456';
    await user.save();

    res.json({ 
      message: '✅ Contraseña reseteada a "123456"',
      user: { nombre: user.nombre, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ver todos los usuarios
app.get('/api/all-users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'nombre', 'email', 'carrera', 'verificado']
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

// ⭐⭐ CAMBIO IMPORTANTE: Crear servidor HTTP para Socket.IO
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 SECCIMATCH CON MYSQL Y WEBSOCKETS INICIADO');
  console.log(`📡 Servidor: http://localhost:${PORT}`);
  console.log('📍 Base de datos: MySQL 8.0 ✅');
  console.log('📍 WebSockets: Socket.IO ✅');
  console.log('📍 Database: seccimatch ✅');
  console.log('='.repeat(50));
});

// Configurar WebSockets
configureSocket(server);