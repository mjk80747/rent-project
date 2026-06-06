import jwt from 'jsonwebtoken';
import { getTokenKey } from '../config/authConfig.js';

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  const tokenKey = getTokenKey();

  if (!token) {
    return res.status(403).json({ 
      success: false, 
      message: 'Authentication token required' 
    });
  }

  if (!tokenKey) {
    return res.status(500).json({
      success: false,
      message: 'Server auth configuration is missing TOKEN_KEY',
    });
  }

  try {
    const decoded = jwt.verify(token, tokenKey);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};
