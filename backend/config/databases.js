const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración para MySQL
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'seccimatch',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || 'root123',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Función para conectar y probar la base de datos
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Conectado: Base de datos SECCImatch');
    
    // Importar y establecer relaciones
    require('../models/relations');
    
    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync({ alter: true });
    console.log('✅ Tablas de MySQL sincronizadas');
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };