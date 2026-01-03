import VerificationCodeService from '../services/verificationCodeService.js';
import EmailService from '../services/emailService.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';

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
      const lastSentTime = VerificationCodeService.getLastSentTime(email);
      if (lastSentTime) {
        const timeSinceLastSent = Date.now() - lastSentTime;
        const minInterval = 60 * 1000; // 60秒（毫秒）
        
        if (timeSinceLastSent < minInterval) {
          const remainingSeconds = Math.ceil((minInterval - timeSinceLastSent) / 1000);
          return res.status(429).json({
            error: 'TOO_MANY_REQUESTS',
            message: `验证码发送过于频繁，请 ${remainingSeconds} 秒后再试`,
            retryAfter: remainingSeconds,
          });
        }
      }

      // 生成验证码
      const code = VerificationCodeService.generateCode();

      // 存储验证码
      VerificationCodeService.storeCode(email, code);

      // 发送验证码邮件
      try {
        const emailSent = await EmailService.sendVerificationCodeEmail(email, code);

        if (!emailSent) {
          // 如果发送失败，删除已存储的验证码
          VerificationCodeService.deleteCode(email);
          return res.status(500).json({
            error: 'EMAIL_SEND_FAILED',
            message: '验证码发送失败，请检查邮箱地址是否正确，或稍后重试',
          });
        }
      } catch (emailError) {
        console.error('发送邮件时发生异常:', emailError);
        VerificationCodeService.deleteCode(email);
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

  // 发送密码重置验证码
  static async sendResetPasswordCode(req, res) {
    try {
      const { email } = req.body;

      // 检查邮箱是否已注册
      const existingUser = await User.findByEmail(email);
      if (!existingUser) {
        return res.status(400).json({
          error: 'EMAIL_NOT_FOUND',
          message: '该邮箱尚未注册',
        });
      }

      // 检查是否已有有效验证码（防止频繁发送，60秒内只能发送一次）
      const lastSentTime = VerificationCodeService.getLastSentTime(email);
      if (lastSentTime) {
        const timeSinceLastSent = Date.now() - lastSentTime;
        const minInterval = 60 * 1000; // 60秒（毫秒）
        
        if (timeSinceLastSent < minInterval) {
          const remainingSeconds = Math.ceil((minInterval - timeSinceLastSent) / 1000);
          return res.status(429).json({
            error: 'TOO_MANY_REQUESTS',
            message: `验证码发送过于频繁，请 ${remainingSeconds} 秒后再试`,
            retryAfter: remainingSeconds,
          });
        }
      }

      // 生成验证码
      const code = VerificationCodeService.generateCode();

      // 存储验证码
      VerificationCodeService.storeCode(email, code);

      // 发送验证码邮件
      try {
        const emailSent = await EmailService.sendVerificationCodeEmail(email, code);

        if (!emailSent) {
          // 如果发送失败，删除已存储的验证码
          VerificationCodeService.deleteCode(email);
          return res.status(500).json({
            error: 'EMAIL_SEND_FAILED',
            message: '验证码发送失败，请检查邮箱地址是否正确，或稍后重试',
          });
        }
      } catch (emailError) {
        console.error('发送邮件时发生异常:', emailError);
        VerificationCodeService.deleteCode(email);
        return res.status(500).json({
          error: 'EMAIL_SEND_FAILED',
          message: '发送验证码失败，请稍后重试',
        });
      }

      return res.status(200).json({
        message: '验证码已发送到您的邮箱',
        expiresIn: 300, // 5分钟（秒）
      });
    } catch (error) {
      console.error('发送密码重置验证码错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '发送验证码失败，请稍后重试',
      });
    }
  }

  // 验证密码重置验证码并发送新密码
  static async verifyResetPasswordCode(req, res) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          error: 'MISSING_PARAMS',
          message: '请提供邮箱和验证码',
        });
      }

      // 验证验证码
      const result = VerificationCodeService.verifyCode(email, code);

      if (!result.valid) {
        return res.status(400).json({
          valid: false,
          error: 'INVALID_CODE',
          message: result.message,
        });
      }

      // 检查用户是否存在
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(400).json({
          error: 'USER_NOT_FOUND',
          message: '用户不存在',
        });
      }

      // 生成随机密码
      const generateRandomPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
      };

      const newPassword = generateRandomPassword();
      
      // 更新用户密码
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
        [passwordHash, email]
      );

      // 发送包含新密码的邮件
      try {
        await EmailService.sendNewPasswordEmail(email, user.username, newPassword);
      } catch (emailError) {
        console.error('发送新密码邮件失败:', emailError);
        return res.status(500).json({
          error: 'EMAIL_SEND_FAILED',
          message: '验证码验证成功，但发送新密码邮件失败，请稍后重试',
        });
      }

      return res.status(200).json({
        valid: true,
        message: '验证码验证成功，新密码已发送到您的邮箱',
      });
    } catch (error) {
      console.error('验证密码重置验证码错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '验证失败，请稍后重试',
      });
    }
  }
}

export default VerificationController;

