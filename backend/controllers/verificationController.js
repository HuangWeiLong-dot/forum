import VerificationCodeService from '../services/verificationCodeService.js';
import EmailService from '../services/emailService.js';
import User from '../models/User.js';

class VerificationController {
  // 发送注册验证码
  static async sendVerificationCode(req, res) {
    try {
      const { email } = req.body;

      // 验证邮箱格式
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          error: 'INVALID_EMAIL',
          message: '请输入有效的邮箱地址',
        });
      }

      // 检查邮箱是否已被注册
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          error: 'EMAIL_EXISTS',
          message: '该邮箱已被注册，请使用其他邮箱',
        });
      }

      // 检查是否已有有效验证码（防止频繁发送，60秒内只能发送一次）
      if (VerificationCodeService.hasActiveCode(email)) {
        const remainingTime = VerificationCodeService.getRemainingTime(email);
        if (remainingTime > 240) { // 如果剩余时间超过4分钟（即刚发送不到1分钟）
          return res.status(429).json({
            error: 'TOO_MANY_REQUESTS',
            message: '验证码发送过于频繁，请稍后再试',
            retryAfter: 60 - (300 - remainingTime),
          });
        }
      }

      // 生成验证码
      const code = VerificationCodeService.generateCode();

      // 存储验证码
      VerificationCodeService.storeCode(email, code);

      // 发送验证码邮件
      const emailSent = await EmailService.sendVerificationCodeEmail(email, code);

      if (!emailSent) {
        return res.status(500).json({
          error: 'EMAIL_SEND_FAILED',
          message: '验证码发送失败，请稍后重试',
        });
      }

      return res.status(200).json({
        message: '验证码已发送到您的邮箱',
        expiresIn: 300, // 5分钟（秒）
      });
    } catch (error) {
      console.error('发送验证码错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '发送验证码失败，请稍后重试',
      });
    }
  }

  // 验证验证码（在注册时使用）
  static async verifyCode(req, res) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          error: 'MISSING_PARAMS',
          message: '请提供邮箱和验证码',
        });
      }

      const result = VerificationCodeService.verifyCode(email, code);

      if (result.valid) {
        return res.status(200).json({
          valid: true,
          message: result.message,
        });
      } else {
        return res.status(400).json({
          valid: false,
          error: 'INVALID_CODE',
          message: result.message,
        });
      }
    } catch (error) {
      console.error('验证验证码错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '验证失败，请稍后重试',
      });
    }
  }
}

export default VerificationController;

