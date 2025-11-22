import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './Chat.css';

const Chat = ({ match, currentUser, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Conectar al servidor de WebSockets
    const token = localStorage.getItem('token');
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: token
      }
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔌 Conectado al servidor de WebSockets');
      setIsConnected(true);
      
      // Unirse a la sala del chat
      if (match && match.match_id) {
        newSocket.emit('join_chat', match.match_id);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Desconectado del servidor de WebSockets');
      setIsConnected(false);
    });

    newSocket.on('new_message', (message) => {
      console.log('📨 Nuevo mensaje recibido:', message);
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('user_typing', (data) => {
      if (data.userId !== currentUser.id) {
        setTypingUsers(prev => {
          const exists = prev.find(user => user.userId === data.userId);
          if (!exists) {
            return [...prev, data];
          }
          return prev;
        });
      }
    });

    newSocket.on('user_stop_typing', (data) => {
      setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
    });

    newSocket.on('error', (error) => {
      console.error('❌ Error en WebSocket:', error);
      alert('Error de conexión: ' + error.message);
    });

    return () => {
      console.log('🔌 Cerrando conexión WebSocket');
      newSocket.close();
    };
  }, [match, currentUser]);

  // ✅ Función fetchMessages movida DENTRO del useEffect
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/chat/messages/${match.match_id}`,
          { headers: { Authorization: token } }
        );
        setMessages(response.data);
        
        // Marcar mensajes como leídos
        await axios.put(
          `http://localhost:5000/api/chat/messages/${match.match_id}/read`,
          {},
          { headers: { Authorization: token } }
        );
      } catch (error) {
        console.error('Error cargando mensajes:', error);
      }
    };

    if (match && match.match_id) {
      fetchMessages();
    }
    scrollToBottom();
  }, [match]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start', match.match_id);
    }

    // Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Configurar nuevo timeout para detener typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_stop', match.match_id);
    }, 1000);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !isConnected) return;

    try {
      // Enviar mensaje via WebSocket
      socket.emit('send_message', {
        matchId: match.match_id,
        content: newMessage
      });

      // Detener indicador de typing
      if (isTyping) {
        setIsTyping(false);
        socket.emit('typing_stop', match.match_id);
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      // Fallback: enviar mensaje via HTTP tradicional
      await sendMessageViaHTTP();
    }
  };

  // Fallback para enviar mensaje via HTTP si WebSockets falla
  const sendMessageViaHTTP = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/chat/messages/${match.match_id}`,
        { content: newMessage },
        { headers: { Authorization: token } }
      );

      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error enviando mensaje (fallback):', error);
      alert('Error enviando mensaje. Intenta nuevamente.');
    }
  };

  // ✅ Función ACTUALIZADA para MySQL
  const getOtherUser = () => {
    console.log('🔍 DEBUG MATCH:', match);
    console.log('🔍 DEBUG CURRENT USER:', currentUser);
    
    if (!match || !currentUser) {
      console.warn('❌ Match o currentUser no definidos');
      return { nombre: 'Usuario', carrera: 'No disponible' };
    }
    
    try {
      // En MySQL, el match viene con user object directamente
      const otherUser = match.user;
      
      if (!otherUser) {
        console.warn('❌ Usuario del match no definido');
        return { nombre: 'Usuario', carrera: 'No disponible' };
      }
      
      console.log('🔍 OTHER USER:', otherUser);
      
      // Verificar que el otherUser tenga datos
      if (!otherUser.nombre) {
        console.warn('❌ OtherUser sin nombre:', otherUser);
        return { 
          nombre: otherUser.email || 'Usuario', 
          carrera: otherUser.carrera || 'No disponible' 
        };
      }
      
      return otherUser;
    } catch (error) {
      console.error('❌ Error obteniendo usuario:', error);
      return { nombre: 'Usuario', carrera: 'Error' };
    }
  };

  // ✅ LLAMAR la función y guardar el resultado
  const otherUser = getOtherUser();

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={onBack} className="back-button">← Volver</button>
        <div className="chat-user-info">
          <h3>{otherUser.nombre}</h3>
          <span className="user-career">{otherUser.carrera}</span>
          <div className="connection-status">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}>
              ●
            </span>
            <span className="status-text">
              {isConnected ? 'En línea' : 'Conectando...'}
            </span>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.Author && message.Author.id === currentUser.id ? 'own-message' : 'other-message'}`}
          >
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-time">
              {new Date(message.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        ))}
        
        {/* Indicadores de typing */}
        {typingUsers.map((user) => (
          <div key={user.userId} className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">{user.userName} está escribiendo...</span>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Escribe un mensaje..."
          className="message-input"
          disabled={!isConnected}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!newMessage.trim() || !isConnected}
        >
          {isConnected ? '📤' : '⏳'}
        </button>
      </form>
    </div>
  );
};

export default Chat;