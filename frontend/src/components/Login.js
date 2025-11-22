import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      // Guardar token y usuario
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      alert('🎓 ¡Bienvenido de vuelta a SECCImatch!\n\nTu conexión con la comunidad universitaria ha sido restablecida.');
      if (onLoginSuccess) {
        onLoginSuccess(response.data.user);
      }

    } catch (error) {
      setError(error.response?.data?.error || 'Error en el login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🔐 Iniciar Sesión</h2>
        <p className="subtitle">Bienvenido de vuelta a SECCImatch</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="correo@ecci.edu.co"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="switch-auth">
          ¿No tienes cuenta?{' '}
          <span onClick={onSwitchToRegister} className="auth-link">
            Regístrate aquí
          </span>
        </p>
        
        <div className="public-links">
          <span onClick={() => window.showPublicTerms?.()} className="public-link">
            Términos de Servicio
          </span>
          <span> • </span>
          <span onClick={() => window.showPublicPrivacy?.()} className="public-link">
            Política de Privacidad
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;