const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración para Aiven MySQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false
    }
  },
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Función para conectar y probar la base de datos
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a Aiven MySQL');
    
    // Importar y establecer relaciones
    require('../models/relations');
    
    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync({ force: false });
    console.log('✅ Tablas de MySQL sincronizadas');
  } catch (error) {
    console.error('❌ Error conectando a Aiven MySQL:', error.message);
  }
};

module.exports = { sequelize, connectDB };