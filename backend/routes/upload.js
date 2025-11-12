import express from 'express';
import UploadController from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 上传单个图片（需要认证）
router.post(
  '/image',
  authenticate,
  UploadController.uploadSingle,
  UploadController.handleUpload
);

// 上传多个图片（需要认证）
router.post(
  '/images',
  authenticate,
  UploadController.uploadMultiple,
  UploadController.handleMultipleUpload
);

export default router;

