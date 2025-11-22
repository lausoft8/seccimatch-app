import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PendingMatches.css';

const PendingMatches = ({ onBack, onMatch }) => {
  const [pendingMatches, setPendingMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingMatches();
  }, []);

  const fetchPendingMatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/matches/pending', {
        headers: { Authorization: token }
      });
      console.log('📥 PENDIENTES RECIBIDOS:', response.data);
      setPendingMatches(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error cargando matches pendientes:', error);
      setLoading(false);
    }
  };

  const handleAccept = async (matchId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/matches/accept/${matchId}`, 
        {}, 
        { headers: { Authorization: token } }
      );

      if (response.data.match) {
        alert(`🎉 ${response.data.message}`);
        if (onMatch) onMatch();
      }
      
      fetchPendingMatches(); // Recargar lista
    } catch (error) {
      console.error('Error aceptando match:', error);
      alert('Error aceptando el like: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleReject = async (matchId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/matches/reject/${matchId}`, 
        {}, 
        { headers: { Authorization: token } }
      );

      alert('Like rechazado');
      fetchPendingMatches(); // Recargar lista
    } catch (error) {
      console.error('Error rechazando match:', error);
      alert('Error rechazando el like: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return (
      <div className="pending-container">
        <div className="loading">Cargando likes pendientes...</div>
      </div>
    );
  }

  return (
    <div className="pending-container">
      <div className="pending-header">
        <button onClick={onBack} className="back-btn">← Volver</button>
        <h2>⏳ Likes Recibidos</h2>
        <div className="pending-count">{pendingMatches.length} pendientes</div>
      </div>

      {pendingMatches.length === 0 ? (
        <div className="no-pending">
          <h3>No tienes likes pendientes</h3>
          <p>Usa "Descubrir" para conocer más estudiantes</p>
        </div>
      ) : (
        <div className="pending-grid">
          {pendingMatches.map((pending) => (
            <div key={pending.match_id} className="pending-card">
              <div className="pending-avatar">
                {pending.user.fotoPerfil ? '🖼️' : '👤'}
              </div>
              <h3>{pending.user.nombre}</h3>
              <p className="pending-career">{pending.user.carrera} - Semestre {pending.user.semestre}</p>
              
              {pending.user.intereses && pending.user.intereses.length > 0 && (
                <div className="pending-interests">
                  {pending.user.intereses.slice(0, 3).map((interest, i) => (
                    <span key={i} className="interest-tag">#{interest}</span>
                  ))}
                </div>
              )}
              
              <p className="pending-date">
                Te dio like el {new Date(pending.liked_at).toLocaleDateString()} a las {' '}
                {new Date(pending.liked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              
              <div className="pending-actions">
                <button 
                  onClick={() => handleReject(pending.match_id)}
                  className="reject-btn"
                >
                  ✖ Rechazar
                </button>
                <button 
                  onClick={() => handleAccept(pending.match_id)}
                  className="accept-btn"
                >
                  💙 Aceptar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingMatches;