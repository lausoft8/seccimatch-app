import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Feed.css';

const Feed = ({ onBack }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});
  const [postComments, setPostComments] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/feed/posts', {
        headers: { Authorization: token }
      });
      
      console.log('📝 Posts recibidos:', response.data);
      setPosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error cargando posts:', error);
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/feed/posts/${postId}/comments`,
        { headers: { Authorization: token } }
      );

      setPostComments(prev => ({
        ...prev,
        [postId]: response.data
      }));

    } catch (error) {
      console.error('Error cargando comentarios:', error);
    }
  };

  const createPost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() || posting) return;

    setPosting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/feed/posts',
        { content: newPostContent },
        { headers: { Authorization: token } }
      );

      console.log('✅ Post creado:', response.data);
      setPosts([response.data, ...posts]);
      setNewPostContent('');
    } catch (error) {
      console.error('Error creando post:', error);
      alert('Error creando el post: ' + (error.response?.data?.error || error.message));
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/feed/posts/${postId}/like`,
        {},
        { headers: { Authorization: token } }
      );

      // Actualizar el contador de likes
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes_count: response.data.new_likes_count 
            }
          : post
      ));

    } catch (error) {
      console.error('Error en like:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este post?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/feed/posts/${postId}`,
        { headers: { Authorization: token } }
      );

      // Remover el post de la lista
      setPosts(posts.filter(post => post.id !== postId));
      alert('Post eliminado exitosamente');

    } catch (error) {
      console.error('Error eliminando post:', error);
      alert('Error eliminando el post: ' + (error.response?.data?.error || error.message));
    }
  };

  const toggleComments = async (postId) => {
    const currentlyShowing = showComments[postId];
    
    // Si vamos a mostrar comentarios y no los tenemos cargados, cargarlos
    if (!currentlyShowing && !postComments[postId]) {
      await fetchComments(postId);
    }

    setShowComments(prev => ({
      ...prev,
      [postId]: !currentlyShowing
    }));
  };

  const handleCommentChange = (postId, value) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  const submitComment = async (postId, e) => {
    e.preventDefault();
    const commentContent = commentInputs[postId]?.trim();
    
    if (!commentContent) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/feed/posts/${postId}/comments`,
        { content: commentContent },
        { headers: { Authorization: token } }
      );

      // Actualizar el post con el nuevo comentario
      const updatedPosts = posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              comments_count: (post.comments_count || 0) + 1
            }
          : post
      );
      setPosts(updatedPosts);

      // Agregar el comentario a la lista local
      setPostComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), response.data]
      }));

      // Limpiar el input
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ''
      }));

      console.log('✅ Comentario creado:', response.data);

    } catch (error) {
      console.error('Error creando comentario:', error);
      alert('Error creando comentario: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/feed/comments/${commentId}`,
        { headers: { Authorization: token } }
      );

      // Remover el comentario de la lista local
      setPostComments(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(comment => comment.id !== commentId)
      }));

      // Actualizar contador en el post
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              comments_count: Math.max(0, (post.comments_count || 1) - 1)
            }
          : post
      ));

    } catch (error) {
      console.error('Error eliminando comentario:', error);
      alert('Error eliminando comentario: ' + (error.response?.data?.error || error.message));
    }
  };

  // Función para verificar si el usuario actual es el autor del post/comentario
  const isCurrentUserAuthor = (item) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    return item.User && item.User.id === currentUser.id;
  };

  if (loading) {
    return (
      <div className="feed-container">
        <div className="feed-loading">Cargando feed universitario... 🎓</div>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <div className="feed-header">
        <button onClick={onBack} className="back-button">← Volver</button>
        <h1>📱 Feed SECCImatch</h1>
        <p className="feed-subtitle">Comunidad universitaria en acción</p>
      </div>

      {/* Crear publicación */}
      <form onSubmit={createPost} className="create-post">
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="¿Qué está pasando en la universidad? Comparte noticias, preguntas o experiencias... 🎓"
          maxLength={500}
          className="post-input"
          rows="4"
        />
        <div className="post-actions">
          <span className="char-count">{newPostContent.length}/500</span>
          <button 
            type="submit" 
            disabled={!newPostContent.trim() || posting} 
            className="post-button"
          >
            {posting ? 'Publicando...' : 'Publicar 🚀'}
          </button>
        </div>
      </form>

      {/* Lista de publicaciones */}
      <div className="posts-list">
        {posts.length === 0 ? (
          <div className="no-posts">
            <h3>¡Sé el primero en publicar! 🎉</h3>
            <p>Comparte algo con la comunidad universitaria</p>
            <div className="post-ideas">
              <p>💡 <strong>Ideas para publicar:</strong></p>
              <ul>
                <li>¿Alguien para estudiar en grupo?</li>
                <li>¡Evento interesante en la universidad!</li>
                <li>Pregunta sobre una materia</li>
                <li>Logro académico que quieras compartir</li>
              </ul>
            </div>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-author">
                  <div className="author-avatar">
                    {post.User?.fotoPerfil ? (
                      <img src={post.User.fotoPerfil} alt={post.User.nombre} />
                    ) : (
                      '👤'
                    )}
                  </div>
                  <div className="author-info">
                    <strong className="author-name">{post.User?.nombre || 'Usuario'}</strong>
                    <span className="author-career">{post.User?.carrera || 'Estudiante ECCI'}</span>
                  </div>
                </div>
                
                {/* Botón eliminar (solo para el autor) */}
                {isCurrentUserAuthor(post) && (
                  <button 
                    onClick={() => handleDeletePost(post.id)}
                    className="delete-post-btn"
                    title="Eliminar post"
                  >
                    🗑️
                  </button>
                )}
              </div>
              
              <div className="post-content">
                {post.content}
              </div>

              {post.image_url && (
                <div className="post-image">
                  <img src={post.image_url} alt="Post content" />
                </div>
              )}

              <div className="post-footer">
                <div className="post-actions-left">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className="like-button"
                  >
                    ❤️ {post.likes_count || 0}
                  </button>
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className="comment-button"
                  >
                    💬 {post.comments_count || 0}
                  </button>
                </div>
                <span className="post-time">
                  {new Date(post.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {/* Sección de comentarios */}
              {showComments[post.id] && (
                <div className="comments-section">
                  {/* Formulario para nuevo comentario */}
                  <form onSubmit={(e) => submitComment(post.id, e)} className="comment-form">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => handleCommentChange(post.id, e.target.value)}
                      placeholder="Escribe un comentario..."
                      maxLength={200}
                      className="comment-input"
                    />
                    <button 
                      type="submit" 
                      disabled={!commentInputs[post.id]?.trim()}
                      className="comment-submit-btn"
                    >
                      Comentar
                    </button>
                  </form>

                  {/* Lista de comentarios */}
                  <div className="comments-list">
                    {postComments[post.id] && postComments[post.id].length > 0 ? (
                      postComments[post.id].map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-header">
                            <div className="comment-author">
                              <strong className="comment-author-name">
                                {comment.User?.nombre || 'Usuario'}
                              </strong>
                              <span className="comment-author-career">
                                {comment.User?.carrera || 'Estudiante'}
                              </span>
                            </div>
                            <div className="comment-actions">
                              <span className="comment-time">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                              {isCurrentUserAuthor(comment) && (
                                <button 
                                  onClick={() => handleDeleteComment(comment.id, post.id)}
                                  className="delete-comment-btn"
                                  title="Eliminar comentario"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="comment-content">{comment.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="no-comments">No hay comentarios aún. ¡Sé el primero en comentar!</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;