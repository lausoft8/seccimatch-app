const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Post, User, Comment } = require('../models');

// OBTENER TODOS LOS POSTS
router.get('/posts', auth, async (req, res) => {
  try {
    console.log('📝 Usuario solicitando feed:', req.user.nombre);
    
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'nombre', 'carrera', 'fotoPerfil']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    console.log(`📊 Enviando ${posts.length} posts al feed`);
    res.json(posts);

  } catch (error) {
    console.error('Error en feed:', error);
    res.status(500).json({ error: 'Error cargando el feed' });
  }
});

// CREAR NUEVO POST
router.post('/posts', auth, async (req, res) => {
  try {
    const { content, image_url, privacy } = req.body;
    const currentUser = req.user;

    console.log('📝 Creando nuevo post:', { 
      usuario: currentUser.nombre, 
      contenido: content 
    });

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'El contenido no puede estar vacío' });
    }

    const post = await Post.create({
      user_id: currentUser.id,
      content: content.trim(),
      image_url: image_url || null,
      privacy: privacy || 'public',
      post_type: image_url ? 'image' : 'text',
      likes_count: 0,
      comments_count: 0
    });

    // Obtener el post con datos del usuario
    const postWithUser = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'nombre', 'carrera', 'fotoPerfil']
        }
      ]
    });

    console.log('✅ Post creado exitosamente:', postWithUser.id);
    res.status(201).json(postWithUser);

  } catch (error) {
    console.error('❌ Error creando post:', error);
    res.status(500).json({ error: 'Error creando el post: ' + error.message });
  }
});

// DAR LIKE A UN POST
router.post('/posts/:postId/like', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const currentUser = req.user;

    const post = await Post.findByPk(postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    // Incrementar likes
    await Post.update(
      { likes_count: post.likes_count + 1 },
      { where: { id: postId } }
    );

    res.json({ 
      message: 'Like agregado',
      new_likes_count: post.likes_count + 1
    });

  } catch (error) {
    console.error('Error dando like:', error);
    res.status(500).json({ error: 'Error dando like' });
  }
});

// ELIMINAR POST
router.delete('/posts/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const currentUser = req.user;

    const post = await Post.findOne({
      where: { 
        id: postId,
        user_id: currentUser.id
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado o no autorizado' });
    }

    await Post.destroy({ where: { id: postId } });

    res.json({ message: 'Post eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando post:', error);
    res.status(500).json({ error: 'Error eliminando el post' });
  }
});

// SISTEMA DE COMENTARIOS

// OBTENER COMENTARIOS DE UN POST
router.get('/posts/:postId/comments', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    console.log('💬 Solicitando comentarios para post:', postId);

    const comments = await Comment.findAll({
      where: { post_id: postId },
      include: [
        {
          model: User,
          attributes: ['id', 'nombre', 'carrera', 'fotoPerfil']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    console.log(`📋 Enviando ${comments.length} comentarios`);
    res.json(comments);

  } catch (error) {
    console.error('Error obteniendo comentarios:', error);
    res.status(500).json({ error: 'Error obteniendo comentarios' });
  }
});

// CREAR COMENTARIO
router.post('/posts/:postId/comments', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const currentUser = req.user;

    console.log('💬 Creando comentario:', { 
      usuario: currentUser.nombre, 
      postId: postId,
      contenido: content 
    });

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'El comentario no puede estar vacío' });
    }

    // Verificar que el post existe
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    // Crear comentario
    const comment = await Comment.create({
      post_id: parseInt(postId),
      user_id: currentUser.id,
      content: content.trim()
    });

    // Obtener comentario con datos del usuario
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'nombre', 'carrera', 'fotoPerfil']
        }
      ]
    });

    // Actualizar contador de comentarios del post
    await Post.update(
      { comments_count: (post.comments_count || 0) + 1 },
      { where: { id: postId } }
    );

    console.log('✅ Comentario creado exitosamente');
    res.status(201).json(commentWithUser);

  } catch (error) {
    console.error('❌ Error creando comentario:', error);
    res.status(500).json({ error: 'Error creando el comentario: ' + error.message });
  }
});

// ELIMINAR COMENTARIO
router.delete('/comments/:commentId', auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const currentUser = req.user;

    const comment = await Comment.findOne({
      where: { 
        id: commentId,
        user_id: currentUser.id
      },
      include: [{ model: Post }]
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comentario no encontrado o no autorizado' });
    }

    // Eliminar comentario
    await Comment.destroy({ where: { id: commentId } });

    // Actualizar contador del post
    await Post.update(
      { comments_count: Math.max(0, (comment.Post.comments_count || 1) - 1) },
      { where: { id: comment.post_id } }
    );

    res.json({ message: 'Comentario eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando comentario:', error);
    res.status(500).json({ error: 'Error eliminando el comentario' });
  }
});

module.exports = router;