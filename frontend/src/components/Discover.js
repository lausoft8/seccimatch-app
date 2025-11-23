import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import './Discover.css';

const Discover = ({ currentUser, onBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDiscoverUsers();
  }, []);

  const fetchDiscoverUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/api/matches/discover`, {
        headers: { Authorization: token }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error cargando usuarios');
      setLoading(false);
    }
  };

  const handleLike = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${config.API_URL}/api/matches/like/${userId}`,
        {},
        { headers: { Authorization: token } }
      );

      if (response.data.match) {
        alert(`🎉 ¡MATCH! Con ${response.data.user.nombre}`);
      }

      // Remover usuario de la lista
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      setError('Error procesando like');
    }
  };

  if (loading) {
    return (
      <div className="discover-container">
        <div className="discover-header">
          <button onClick={onBack} className="back-btn">← Volver</button>
          <h2>🔍 Descubrir Personas</h2>
        </div>
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="discover-container">
      <div className="discover-header">
        <button onClick={onBack} className="back-btn">← Volver</button>
        <h2>🔍 Descubrir Personas</h2>
        <div className="users-count">{users.length} personas disponibles</div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="discover-grid">
        {users.map(user => (
          <div key={user.id} className="discover-card">
            <div className="card-header">
              <div className="user-avatar">
                {user.fotoPerfil ? '🖼️' : '👤'}
              </div>
              <div className="user-info">
                <h3>{user.nombre}</h3>
                <p className="user-career">{user.carrera} - Semestre {user.semestre}</p>
              </div>
            </div>

            {user.bio && (
              <div className="user-bio">
                <p>"{user.bio}"</p>
              </div>
            )}

            {user.intereses && user.intereses.length > 0 && (
              <div className="user-interests">
                <strong>Intereses:</strong>
                <div className="interests-tags">
                  {user.intereses.map((interest, index) => (
                    <span key={index} className="interest-tag">#{interest}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="card-actions">
              <button 
                onClick={() => handleLike(user.id)}
                className="like-btn"
              >
                💙 Me Gusta
              </button>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className="no-users">
          <p>¡No hay más personas para descubrir!</p>
          <p>Vuelve más tarde o invita a más compañeros a unirse.</p>
        </div>
      )}
    </div>
  );
};

export default Discover;