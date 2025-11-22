import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Register from './components/Register';
import Login from './components/Login';
import './App.css';
import Discover from './components/Discover';
import Matches from './components/Matches';
import PendingMatches from './components/PendingMatches';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import Feed from './components/Feed';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showAuth, setShowAuth] = useState(null); // null, 'register', o 'login'
  const [currentUser, setCurrentUser] = useState(null);
  const [showDiscover, setShowDiscover] = useState(false);
  const [showMatches, setShowMatches] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [showPublicTerms, setShowPublicTerms] = useState(false);
  const [showPublicPrivacy, setShowPublicPrivacy] = useState(false);
  const [showFeed, setShowFeed] = useState(false);

  // Verificar si hay usuario logueado al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setCurrentUser(JSON.parse(userData));
    }
    
    fetchUsers();
  }, []);

  // Conectar con el backend
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      setMessage('❌ Error conectando al backend');
      setLoading(false);
    }
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setShowAuth(null); // Cerrar formularios de auth
    fetchUsers(); // Recargar usuarios
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeChat');
    setCurrentUser(null);
  };

  // Si estamos en discover
  if (showDiscover) {
    return (
      <Discover 
        currentUser={currentUser}
        onBack={() => setShowDiscover(false)}
      />
    );
  }

  // Si estamos en el feed
  if (showFeed) {
    return <Feed onBack={() => setShowFeed(false)} />;
  }

  // Si estamos en matches
  if (showMatches) {
    return <Matches onBack={() => setShowMatches(false)} />;  
  }

  // Si estamos viendo términos públicos
  if (showPublicTerms) {
    return <TermsOfService onBack={() => setShowPublicTerms(false)} />;
  }

  // Si estamos viendo privacidad pública  
  if (showPublicPrivacy) {
    return <PrivacyPolicy onBack={() => setShowPublicPrivacy(false)} />;
  }

  if (showPending) {
    return <PendingMatches onBack={() => setShowPending(false)} />;
  }

  // Si estamos en formulario de auth
  if (showAuth) {
    if (showAuth === 'register') {
      return (
        <Register 
          onSwitchToLogin={() => setShowAuth('login')}
          onRegisterSuccess={handleAuthSuccess}
        />
      );
    } else {
      return (
        <Login 
          onSwitchToRegister={() => setShowAuth('register')}
          onLoginSuccess={handleAuthSuccess}
        />
      );
    }
  }

  return (
    <div className="App">
      {/* Contenido principal - SOLO si el usuario está logueado */}
      {currentUser ? (
        <div className="dashboard-container">
          {/* Header Mejorado */}
          <header className="dashboard-header">
            <div className="header-content">
              <div className="header-brand">
                <h1>💞 SECCImatch</h1>
                <p className="subtitle">Conecta, comparte y encuentra tu match en la universidad</p>
              </div>
              <div className="user-nav">
                <div className="user-welcome">
                  <span className="welcome-text">¡Hola, </span>
                  <span className="user-name">{currentUser.nombre}!</span>
                </div>
                <div className="nav-buttons">
                  <button onClick={() => setShowDiscover(true)} className="nav-btn discover-btn">
                    <span className="btn-icon">🔍</span>
                    <span className="btn-text">Descubrir</span>
                  </button>
                  <button onClick={() => setShowMatches(true)} className="nav-btn matches-btn">
                    <span className="btn-icon">💙</span>
                    <span className="btn-text">Matches</span>
                  </button>
                  <button onClick={() => setShowPending(true)} className="nav-btn pending-btn">
                    <span className="btn-icon">⏳</span>
                    <span className="btn-text">Pendientes</span>
                  </button>
                  <button onClick={() => setShowFeed(true)} className="nav-btn feed-btn">
                    <span className="btn-icon">📱</span>
                    <span className="btn-text">Feed</span>
                  </button>
                  <button onClick={handleLogout} className="nav-btn logout-btn">
                    <span className="btn-icon">🚪</span>
                    <span className="btn-text">Salir</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Contenido Principal Mejorado */}
          <main className="dashboard-main">
            {message && <div className="error-message">{message}</div>}
            
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando comunidad universitaria...</p>
              </div>
            ) : (
              <section className="community-section">
                <div className="section-header">
                  <h2>👥 Comunidad Universitaria</h2>
                  <p className="section-subtitle">
                    Conecta con {users.length} estudiantes verificados de la ECCI
                  </p>
                </div>
                
                <div className="users-grid">
                  {users.map((user, index) => (
                    <div key={user._id || index} className="user-card">
                      <div className="card-header">
                        <div className="user-avatar">👤</div>
                        <div className="user-basic-info">
                          <h3 className="user-name">{user.nombre}</h3>
                          <div className="user-academic">
                            <span className="user-career">{user.carrera}</span>
                            <span className="user-semester">Semestre {user.semestre}</span>
                          </div>
                        </div>
                      </div>
                      
                      {user.bio && user.bio.trim() !== '' && (
                        <div className="user-bio-section">
                          <p className="user-bio">"{user.bio}"</p>
                        </div>
                      )}
                      
                      {user.intereses && user.intereses.filter(interest => interest && interest.trim() !== '').length > 0 && (
                        <div className="user-interests-section">
                          <h4 className="interests-title">Intereses</h4>
                          <div className="user-interests">
                            {user.intereses
                              .filter(interest => interest && interest.trim() !== '')
                              .map((interest, i) => (
                                <span key={i} className="interest-tag">
                                  #{interest.trim().toLowerCase()}
                                </span>
                              ))
                            }
                          </div>
                        </div>
                      )}
                      
                    </div>
                  ))}
                </div>
              </section>
            )}

             {/* Features Section Actualizada */}
              <section className="features-section">
                <div className="section-header">
                  <h2>🚀 Próximos Lanzamientos</h2>
                  <p className="section-subtitle">Innovación continua para nuestra comunidad universitaria</p>
                </div>
                
                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon">📅</div>
                    <div className="feature-content">
                      <h3>Eventos Universitarios</h3>
                      <p>Crea y descubre eventos académicos, culturales y sociales dentro del campus</p>
                    </div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🎨</div>
                    <div className="feature-content">
                      <h3>Personalización de Perfil</h3>
                      <p>Sube tu foto real, comparte tu edad y muestra más detalles personales en tu perfil</p>
                    </div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">📱</div>
                    <div className="feature-content">
                      <h3>Moderación Inteligente</h3>
                      <p>Descarga nuestra app para iOS y Android con notificaciones push y mejor rendimiento</p>
                    </div>
                  </div>
                </div>
              </section>
          </main>

          {/* Footer del Dashboard */}
          <footer className="dashboard-footer">
            <div className="footer-content">
              <div className="footer-brand">
                <h3>SECCImatch</h3>
                <p>La red social exclusiva de la Universidad ECCI</p>
              </div>
              <div className="footer-links">
                <span onClick={() => setShowPublicTerms(true)} className="footer-link">
                  Términos de Servicio
                </span>
                <span className="link-separator">•</span>
                <span onClick={() => setShowPublicPrivacy(true)} className="footer-link">
                  Política de Privacidad
                </span>
                <span className="link-separator">•</span>
                <span className="footer-copyright">
                  © 2024 SECCImatch - Proyecto Universitario
                </span>
              </div>
            </div>
          </footer>
        </div>
      ) : (
        /* PANTALLA DE BIENVENIDA para usuarios no logueados */
        <div className="welcome-screen">
          <div className="welcome-content">
            <div className="welcome-hero">
              <h2>Bienvenido a SECCImatch</h2>
              <p>La red social exclusiva para estudiantes de la Universidad ECCI</p>
              
              {/* Botones de auth en la bienvenida */}
              <div className="welcome-auth-buttons">
                <button 
                  onClick={() => setShowAuth('login')} 
                  className="welcome-auth-btn login-btn"
                >
                  Iniciar Sesión
                </button>
                <button 
                  onClick={() => setShowAuth('register')} 
                  className="welcome-auth-btn register-btn"
                >
                  Registrarse
                </button>
              </div>

              <div className="welcome-features">
                <div className="welcome-feature">
                  <span className="feature-icon">🎓</span>
                  <h4>Comunidad Universitaria</h4>
                  <p>Conecta solo con estudiantes ECCI verificados</p>
                </div>
                <div className="welcome-feature">
                  <span className="feature-icon">💙</span>
                  <h4>Encuentra tu Match</h4>
                  <p>Descubre personas con intereses similares</p>
                </div>
                <div className="welcome-feature">
                  <span className="feature-icon">📱</span>
                  <h4>Feed Social</h4>
                  <p>Comparte experiencias universitarias</p>
                </div>
                <div className="welcome-feature">
                  <span className="feature-icon">🔒</span>
                  <h4>Ambiente Seguro</h4>
                  <p>Verificación con correo institucional</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer en la bienvenida */}
          <footer className="app-footer">
            <p>SECCImatch - Proyecto Universitario 🎓</p>
            <div className="footer-links">
              <span onClick={() => setShowPublicTerms(true)} className="footer-link">
                Términos de Servicio
              </span>
              <span> • </span>
              <span onClick={() => setShowPublicPrivacy(true)} className="footer-link">
                Política de Privacidad
              </span>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}

export default App;