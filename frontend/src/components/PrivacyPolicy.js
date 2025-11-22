import React from 'react';
import './TermsPrivacy.css';

const PrivacyPolicy = ({ onBack }) => {
  return (
    <div className="terms-privacy-container">
      <div className="terms-privacy-header">
        <button onClick={onBack} className="back-button">
          ← Volver
        </button>
        <h1>🛡️ Política de Privacidad - SECCImatch</h1>
      </div>

      <div className="terms-privacy-content">
        {/* Sección de Datos que Recopilamos */}
        <div className="section-card">
          <h2>📊 Datos que Recopilamos</h2>
          <div className="data-grid">
            <div className="data-item">
              <div className="data-icon">👤</div>
              <div className="data-content">
                <h3>Información de Identificación</h3>
                <p>Correo institucional, nombre completo</p>
              </div>
            </div>
            
            <div className="data-item">
              <div className="data-icon">🎓</div>
              <div className="data-content">
                <h3>Información Académica</h3>
                <p>Carrera, semestre, facultad</p>
              </div>
            </div>
            
            <div className="data-item">
              <div className="data-icon">📸</div>
              <div className="data-content">
                <h3>Perfil Personal</h3>
                <p>Foto de perfil, intereses, biografía</p>
              </div>
            </div>
            
            <div className="data-item">
              <div className="data-icon">📈</div>
              <div className="data-content">
                <h3>Actividad en la Plataforma</h3>
                <p>Matches, mensajes, publicaciones, eventos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Uso de la Información */}
        <div className="section-card">
          <h2>🎯 Uso de la Información</h2>
          <div className="usage-grid">
            <div className="usage-item-privacy">
              <div className="usage-icon-privacy">🔍</div>
              <div className="usage-content">
                <h4>Verificar identidad universitaria</h4>
                <p>Confirmar que eres estudiante activo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer de seguridad */}
        <div className="security-footer">
          <div className="security-badge">
            <span className="badge-icon">🔒</span>
            <span>Tu privacidad es nuestra prioridad</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;