import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';
import './Register.css';
import TermsOfService from './TermsOfService';
import PrivacyPolicy from './PrivacyPolicy';

const Register = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    carrera: '',
    semestre: '',
    intereses: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const carreras = [
    'Ingeniería de Sistemas',
    'Ingeniería Mecánica', 
    'Ingeniería Industrial',
    'Ingeniería Electrónica',
    'Psicología',
    'Administración de Empresas',
    'Diseño Gráfico',
    'Medicina',
    'Derecho'
  ];

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

    // Validar aceptación de términos
    if (!acceptedTerms || !acceptedPrivacy) {
      setError('Debes aceptar los Términos de Servicio y Política de Privacidad');
      setLoading(false);
      return;
    }

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (!formData.email.endsWith('@ecci.edu.co')) {
      setError('Solo se permiten correos @ecci.edu.co');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${config.API_URL}/api/auth/register`, {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        carrera: formData.carrera,
        semestre: parseInt(formData.semestre),
        intereses: formData.intereses
            .split(',')
            .map(i => i.trim())
            .filter(i => i && i.length > 0),
        bio: formData.bio
      });

      // Guardar token en localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      alert('✨ ¡Cuenta verificada exitosamente!\n\nBienvenido a la comunidad exclusiva de estudiantes ECCI.\nTu aventura universitaria acaba de comenzar.');
      if (onRegisterSuccess) {
        onRegisterSuccess(response.data.user);
      }

    } catch (error) {
      setError(error.response?.data?.error || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  // ✅ AGREGA ESTO - Mostrar términos de servicio
  if (showTerms) {
    return (
      <TermsOfService 
        onAccept={() => {
          setShowTerms(false);
          setAcceptedTerms(true);
        }}
        onBack={() => setShowTerms(false)}
      />
    );
  }

  if (showPrivacy) {
    return (
      <PrivacyPolicy 
        onAccept={() => {
          setShowPrivacy(false);
          setAcceptedPrivacy(true);
        }}
        onBack={() => setShowPrivacy(false)}
      />
    );
  }
  
  return (
    <div className="register-container">
      <div className="register-card">
        <h2>🎓 Regístrate en SECCImatch</h2>
        <p className="subtitle">Únete a la comunidad universitaria</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

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

          <div className="form-row">
            <div className="form-group">
              <select
                name="carrera"
                value={formData.carrera}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona tu carrera</option>
                {carreras.map(carrera => (
                  <option key={carrera} value={carrera}>{carrera}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <select
                name="semestre"
                value={formData.semestre}
                onChange={handleChange}
                required
              >
                <option value="">Semestre</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1}°</option>
                ))}
              </select>
            </div>
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

          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="intereses"
              placeholder="Tus intereses (separados por comas)"
              value={formData.intereses}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <textarea
              name="bio"
              placeholder="Cuéntanos sobre ti..."
              value={formData.bio}
              onChange={handleChange}
              rows="3"
            />
          </div>

           {/* ✅ AGREGA ESTO - Checkboxes de términos y privacidad */}
          <div className="terms-section">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <label htmlFor="terms">
                He leído y acepto los{' '}
                <span onClick={() => setShowTerms(true)} className="link">
                  Términos de Servicio
                </span>
              </label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="privacy"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              />
              <label htmlFor="privacy">
                He leído y acepto la{' '}
                <span onClick={() => setShowPrivacy(true)} className="link">
                  Política de Privacidad
                </span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading} className="register-btn">
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="switch-auth">
          ¿Ya tienes cuenta?{' '}
          <span onClick={onSwitchToLogin} className="auth-link">
            Inicia sesión aquí
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;