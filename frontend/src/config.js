// Configuración para producción/desarrollo
const config = {
  // URL del backend - cambia automáticamente entre desarrollo y producción
  API_URL: process.env.NODE_ENV === 'production' 
    ? 'https://seccimatch-app.onrender.com' 
    : 'http://localhost:5000'
};

export default config;