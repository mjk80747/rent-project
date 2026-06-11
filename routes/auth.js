import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import connectDB from '../config/db.js';
import { getAuthMode, getTokenKey } from '../config/authConfig.js';
import {
  compareDemoPassword,
  createDemoUser,
  findDemoUserByEmail,
  findDemoUserByPhone,
  findDemoUserById,
  isDemoAuthEnabled,
} from '../config/demoAuth.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

const ensureAuthConfig = (res) => {
  if (!getTokenKey()) {
    res.status(500).json({
      success: false,
      message: 'Server auth configuration is missing TOKEN_KEY',
    });
    return false;
  }

  return true;
};

const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const sendAuthSuccess = (res, user, statusCode = 200, message = 'Login successful') => {
  const token = jwt.sign(
    { id: user.id || user._id },
    getTokenKey(),
    { expiresIn: '7d' }
  );

  setAuthCookie(res, token);

  res.status(statusCode).json({
    success: true,
    message,
    mode: getAuthMode(),
    user: {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });
};

const validateEmail = (email) => {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

const validatePhone = (phone) => {
  return /^[0-9]{10}$/.test(phone);
};

router.post('/signup', async (req, res) => {
  try {
    if (!ensureAuthConfig(res)) return;

    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be 10 digits',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (isDemoAuthEnabled()) {
      const existingEmail = await findDemoUserByEmail(email);
      const existingPhone = await findDemoUserByPhone(phone);

      if (existingEmail || existingPhone) {
        return res.status(409).json({
          success: false,
          message: existingEmail ? 'Email already registered' : 'Phone number already registered',
        });
      }

      const user = await createDemoUser({ name, email, phone, password });
      return sendAuthSuccess(res, user, 201, 'Account created successfully in demo mode');
    }

    await connectDB();

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.email === email
          ? 'Email already registered'
          : 'Phone number already registered',
      });
    }

    const user = new User({ name, email, phone, password });
    await user.save();
    return sendAuthSuccess(res, user, 201, 'User created successfully');
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    if (!ensureAuthConfig(res)) return;

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    if (isDemoAuthEnabled()) {
      const user = await findDemoUserByEmail(email);

      if (!user || !(await compareDemoPassword(user, password))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      return sendAuthSuccess(res, user);
    }

    await connectDB();

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    return sendAuthSuccess(res, user);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
    });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    if (isDemoAuthEnabled()) {
      const user = await findDemoUserById(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.json({
        success: true,
        mode: getAuthMode(),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });
    }

    await connectDB();
    const user = await User.findById(req.userId);

    return res.json({
      success: true,
      mode: getAuthMode(),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
    });
  }
});

export default router;
