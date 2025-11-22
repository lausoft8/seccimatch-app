import React from 'react';
import './TermsPrivacy.css';

const TermsOfService = ({ onBack }) => {
  return (
    <div className="terms-privacy-container">
      <div className="terms-privacy-header">
        <button onClick={onBack} className="back-button">
          ← Volver
        </button>
        <h1>📜 Términos de Servicio - SECCImatch</h1>
      </div>

      <div className="terms-privacy-content">
        <div className="section-card">
          <h2>🎓 Uso Seguro y Responsable</h2>
          <div className="content-box">
            <p><strong>Requisitos:</strong> Ser estudiante activo de la Universidad ECCI con correo institucional válido.</p>
          </div>
        </div>

        <div className="section-card">
          <h2>⭐ Normas de Conducta</h2>
          <div className="rules-list">
            <div className="rule-item checked">
              <span className="rule-icon">✅</span>
              <span className="rule-text">Respetar a todos los miembros de la comunidad universitaria</span>
            </div>
            <div className="rule-item checked">
              <span className="rule-icon">✅</span>
              <span className="rule-text">No suplantar identidades o crear perfiles falsos</span>
            </div>
            <div className="rule-item checked">
              <span className="rule-icon">✅</span>
              <span className="rule-text">No publicar contenido ofensivo, discriminatorio o ilegal</span>
            </div>
            <div className="rule-item checked">
              <span className="rule-icon">✅</span>
              <span className="rule-text">No compartir información personal sensible</span>
            </div>
            <div className="rule-item">
              <span className="rule-icon">🔒</span>
              <span className="rule-text">Mantener un ambiente universitario seguro y inclusivo</span>
            </div>
          </div>
        </div>

        <div className="section-card warning-card">
          <h2>⚠️ Consecuencias por Incumplimiento</h2>
          <div className="content-box">
            <p>El incumplimiento de estas normas puede resultar en la <strong>suspensión temporal o permanente</strong> de la cuenta, según la gravedad de la falta.</p>
          </div>
        </div>

        <div className="acceptance-section">
          <div className="acceptance-box">
            <h3>🎯 Al usar SECCImatch aceptas:</h3>
            <ul>
              <li>Ser estudiante activo de la Universidad ECCI</li>
              <li>Cumplir con las normas de conducta establecidas</li>
              <li>Responsabilizarte por el contenido que compartas</li>
              <li>Reportar cualquier comportamiento inapropiado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;