import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chat from './Chat';
import './Matches.css';

const Matches = ({ onBack }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      console.log('👤 USUARIO ACTUAL CARGADO:', user.nombre, user.id);
    }
    fetchMatches();
  }, []);

  // Recuperar chat activo al recargar
  useEffect(() => {
    if (currentUser) {
      const activeChat = localStorage.getItem('activeChat');
      if (activeChat) {
        try {
          const matchData = JSON.parse(activeChat);
          console.log('💾 CHAT ACTIVO RECUPERADO:', matchData);
          setSelectedMatch(matchData);
        } catch (error) {
          console.error('Error recuperando chat activo:', error);
          localStorage.removeItem('activeChat');
        }
      }
    }
  }, [currentUser]);

  // Escuchar eventos de actualización de matches
  useEffect(() => {
    const handleMatchUpdate = () => {
      console.log('🔄 Actualizando matches por evento...');
      fetchMatches();
    };

    window.addEventListener('matchUpdated', handleMatchUpdate);
    
    return () => {
      window.removeEventListener('matchUpdated', handleMatchUpdate);
    };
  }, []);

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Solicitando matches al backend...');
      
      const response = await axios.get('http://localhost:5000/api/matches/my-matches', {
        headers: { Authorization: token }
      });
      
      console.log('🎯 MATCHES RECIBIDOS DEL BACKEND:', response.data);
      setMatches(response.data);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching matches:', error);
      setLoading(false);
    }
  };

  const handleOpenChat = (match) => {
    console.log('💬 ABRIENDO CHAT CON:', match.user.nombre);
    setSelectedMatch(match);
    localStorage.setItem('activeChat', JSON.stringify(match));
  };

  const handleBackFromChat = () => {
    console.log('🚪 CERRANDO CHAT');
    setSelectedMatch(null);
    localStorage.removeItem('activeChat');
  };

  // ✅ Si hay un match seleccionado, mostrar chat
  if (selectedMatch) {
    return (
      <Chat 
        match={selectedMatch}
        currentUser={currentUser}
        onBack={handleBackFromChat}
      />
    );
  }

  return (
    <div className="matches-container">
      <div className="matches-header">
        <button onClick={onBack} className="back-button">← Volver al Dashboard</button>
        <h1>💙 Tus Matches</h1>
        <button onClick={fetchMatches} className="refresh-button">🔄 Actualizar</button>
      </div>

      {loading ? (
        <div className="loading">Cargando matches...</div>
      ) : matches.length === 0 ? (
        <div className="no-matches">
          <h3>¡Aún no tienes matches!</h3>
          <p>Continúa descubriendo personas para hacer match</p>
        </div>
      ) : (
        <div className="matches-grid">
          {matches.map((match) => {
            const otherUser = match.user;
            
            if (!otherUser) {
              return (
                <div key={match.match_id} className="match-card error-card">
                  <div className="match-avatar">❓</div>
                  <h3>Usuario no disponible</h3>
                  <p className="match-career">Error cargando datos del match</p>
                  <button className="chat-button" disabled>
                    💬 Chat no disponible
                  </button>
                </div>
              );
            }

            return (
              <div key={match.match_id} className="match-card">
                <div className="match-avatar">
                  {otherUser.fotoPerfil ? (
                    <img src={otherUser.fotoPerfil} alt={otherUser.nombre} />
                  ) : (
                    '👤'
                  )}
                </div>
                <h3>{otherUser.nombre}</h3>
                <p className="match-career">{otherUser.carrera}</p>
                <p className="match-semester">Semestre {otherUser.semestre}</p>
                
                {otherUser.intereses && otherUser.intereses.length > 0 && (
                  <div className="match-interests">
                    {otherUser.intereses.slice(0, 3).map((interest, i) => (
                      <span key={i} className="interest-tag">#{interest}</span>
                    ))}
                  </div>
                )}
                
                <button 
                  onClick={() => handleOpenChat(match)}
                  className="chat-button"
                >
                  💬 Iniciar Chat
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Matches;