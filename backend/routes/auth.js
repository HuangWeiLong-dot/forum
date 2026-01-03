import express from 'express';
import AuthController from '../controllers/authController.js';
import VerificationController from '../controllers/verificationController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// 发送注册验证码
router.post(
  '/send-verification-code',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('请输入有效的邮箱地址')
      .normalizeEmail(),
    handleValidationErrors,
  ],
  VerificationController.sendVerificationCode
);

// 用户注册
router.post('/register', validateRegister, AuthController.register);

// 用户登录
router.post('/login', validateLogin, AuthController.login);

// 用户登出
router.post('/logout', authenticate, AuthController.logout);

// 发送密码重置验证码
router.post(
  '/reset-password/send-code',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('请输入有效的邮箱地址')
      .normalizeEmail(),
    handleValidationErrors,
  ],
  VerificationController.sendResetPasswordCode
);

// 验证密码重置验证码并发送新密码
router.post(
  '/reset-password/verify-code',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('请输入有效的邮箱地址')
      .normalizeEmail(),
    body('code')
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage('验证码必须是6位数字'),
    handleValidationErrors,
  ],
  VerificationController.verifyResetPasswordCode
);

export default router;

