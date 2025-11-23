const { sequelize } = require('./config/databases');
const { User, Match, Message, Post, Comment } = require('./models');

async function createTables() {
  try {
    console.log('🔄 Creando tablas en Aiven MySQL...');
    
    // Sincronizar todos los modelos
    await sequelize.sync({ force: false });
    console.log('✅ Todas las tablas creadas/existen');
    
    // Crear usuario de prueba
    const testUser = await User.create({
      nombre: 'Laura Gómez',
      email: 'laura.gomez@ecci.edu.co',
      password: '123456',
      carrera: 'Ingeniería de Sistemas',
      semestre: 5,
      intereses: ['tecnología', 'música', 'senderismo'],
      bio: 'Estudiante de ingeniería apasionada por la tecnología.',
      verificado: true
    });
    
    console.log('✅ Usuario de prueba creado:', testUser.email);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando tablas:', error);
    process.exit(1);
  }
}

createTables();