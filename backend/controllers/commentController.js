import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { query } from '../config/database.js';

class CommentController {
  // 获取帖子评论列表
  static async getComments(req, res) {
    try {
      const { postId } = req.params;
      const { page = 1 } = req.query;

      // 验证帖子是否存在
      const post = await Post.findById(parseInt(postId));
      if (!post) {
        return res.status(404).json({
          error: 'POST_NOT_FOUND',
          message: '帖子不存在',
        });
      }

      const comments = await Comment.findByPostId(parseInt(postId), {
        page: parseInt(page),
        limit: 20,
      });

      // comments 已经是格式化后的对象，直接返回
      return res.status(200).json(comments);
    } catch (error) {
      console.error('获取评论列表错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '获取评论列表失败',
      });
    }
  }

  // 创建评论
  static async createComment(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.userId;
      const { content, parentId } = req.body;

      // 验证帖子是否存在
      const post = await Post.findById(parseInt(postId));
      if (!post) {
        return res.status(404).json({
          error: 'POST_NOT_FOUND',
          message: '帖子不存在',
        });
      }

      // 如果 parentId 存在，验证父评论是否存在并检查嵌套深度
      if (parentId) {
        const parentComment = await Comment.findById(parseInt(parentId));
        if (!parentComment) {
          return res.status(404).json({
            error: 'COMMENT_NOT_FOUND',
            message: '父评论不存在',
          });
        }
        // 确保父评论属于同一个帖子
        if (parentComment.post_id !== parseInt(postId)) {
          return res.status(400).json({
            error: 'INVALID_PARENT',
            message: '父评论不属于该帖子',
          });
        }
        
        // 检查嵌套深度（限制为1层）
        const depth = await CommentController.getCommentDepth(parseInt(parentId));
        if (depth >= 1) {
          return res.status(400).json({
            error: 'MAX_DEPTH_REACHED',
            message: '操作失败',
          });
        }
      }

      // 创建评论
      const comment = await Comment.create({
        content,
        authorId: userId,
        postId: parseInt(postId),
        parentId: parentId ? parseInt(parentId) : null,
      });

      const formattedComment = Comment.formatComment(comment);

      // 获取帖子作者ID和评论者用户名
      const [authorResult, commenterResult] = await Promise.all([
        query('SELECT author_id FROM posts WHERE id = $1', [parseInt(postId)]),
        query('SELECT username FROM users WHERE id = $1', [userId])
      ]);
      
      const postAuthorId = authorResult.rows[0]?.author_id;
      const commenterUsername = commenterResult.rows[0]?.username || '用户';
      
      // 如果评论者不是帖子作者，创建通知
      if (postAuthorId && postAuthorId !== userId) {
        try {
          // 获取帖子标题
          const postResult = await query('SELECT title FROM posts WHERE id = $1', [parseInt(postId)]);
          const postTitle = postResult.rows[0]?.title || '帖子';
          
          // 创建评论通知
          await Notification.create({
            userId: postAuthorId,
            type: 'comment',
            title: `${commenterUsername} 评论了你的帖子`,
            content: postTitle,
            relatedPostId: parseInt(postId),
            relatedUserId: userId
          });
        } catch (error) {
          console.error('创建评论通知失败:', error.message);
          // 通知创建失败不影响评论功能
        }
      }

      return res.status(201).json(formattedComment);
    } catch (error) {
      console.error('创建评论错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '创建评论失败',
      });
    }
  }

  // 获取评论的嵌套深度
  static async getCommentDepth(commentId) {
    let depth = 0;
    let currentId = commentId;
    const { query } = await import('../config/database.js');
    
    while (currentId) {
      const result = await query(
        'SELECT parent_id FROM comments WHERE id = $1',
        [currentId]
      );
      
      if (result.rows.length === 0 || !result.rows[0].parent_id) {
        break;
      }
      
      currentId = result.rows[0].parent_id;
      depth++;
      
      // 防止无限循环
      if (depth > 10) break;
    }
    
    return depth;
  }

  // 回复评论
  static async replyComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.userId;
      const { content } = req.body;

      // 验证父评论是否存在并检查嵌套深度
      const parentComment = await Comment.findById(parseInt(commentId));
      if (!parentComment) {
        return res.status(404).json({
          error: 'COMMENT_NOT_FOUND',
          message: '评论不存在',
        });
      }

      // 检查嵌套深度（限制为1层）
      const depth = await CommentController.getCommentDepth(parseInt(commentId));
      if (depth >= 1) {
        return res.status(400).json({
          error: 'MAX_DEPTH_REACHED',
          message: '操作失败',
        });
      }

      // 创建回复
      const comment = await Comment.create({
        content,
        authorId: userId,
        postId: parentComment.post_id,
        parentId: parseInt(commentId),
      });

      const formattedComment = Comment.formatComment(comment);

      // 为被回复的评论作者创建通知
      try {
        // 获取被回复评论的作者ID和回复者用户名
        const [parentCommentResult, commenterResult, postResult] = await Promise.all([
          query('SELECT author_id, post_id FROM comments WHERE id = $1', [parseInt(commentId)]),
          query('SELECT username FROM users WHERE id = $1', [userId]),
          query('SELECT title, author_id FROM posts WHERE id = $1', [parentComment.post_id])
        ]);
        
        const parentAuthorId = parentCommentResult.rows[0]?.author_id;
        const commenterUsername = commenterResult.rows[0]?.username || '用户';
        const postTitle = postResult.rows[0]?.title || '帖子';
        const postAuthorId = postResult.rows[0]?.author_id;
        
        // 如果回复者不是被回复评论的作者，创建通知
        if (parentAuthorId && parentAuthorId !== userId) {
          await Notification.create({
            userId: parentAuthorId,
            type: 'comment_reply',
            title: `${commenterUsername} 回复了你的评论`,
            content: postTitle,
            relatedPostId: parentComment.post_id,
            relatedUserId: userId
          });
        }
        
        // 如果回复者不是帖子作者，也为帖子作者创建通知
        if (postAuthorId && postAuthorId !== userId && postAuthorId !== parentAuthorId) {
          await Notification.create({
            userId: postAuthorId,
            type: 'comment',
            title: `${commenterUsername} 评论了你的帖子`,
            content: postTitle,
            relatedPostId: parentComment.post_id,
            relatedUserId: userId
          });
        }
      } catch (error) {
        console.error('创建回复通知失败:', error.message);
        // 通知创建失败不影响回复功能
      }

      return res.status(201).json(formattedComment);
    } catch (error) {
      console.error('回复评论错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '回复评论失败',
      });
    }
  }
}

export default CommentController;

