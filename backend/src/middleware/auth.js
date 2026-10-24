import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const COOKIE_NAME = 'passvault_session';

/**
 * Generate JWT and set httpOnly cookie on response
 */
export const setSessionCookie = (user, res) => {
  const secret = process.env.JWT_SECRET || 'passvault_dev_secret_at_least_32_chars_long!';
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    secret,
    {
      expiresIn: '7d',
    }
  );

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  return token;
};

/**
 * Clear session cookie
 */
export const clearSessionCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
  });
};

/**
 * Authenticate request middleware
 * Checks httpOnly cookie first, then falls back to Authorization: Bearer token
 */
export const requireAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.[COOKIE_NAME];

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to access your vault.',
      });
    }

    const secret = process.env.JWT_SECRET || 'passvault_dev_secret_at_least_32_chars_long!';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
    if (!user) {
      clearSessionCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Session invalid or user no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    clearSessionCookie(res);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token.',
    });
  }
};
