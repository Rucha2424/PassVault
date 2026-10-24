import User from '../models/User.js';
import Credential from '../models/Credential.js';
import { setSessionCookie, clearSessionCookie } from '../middleware/auth.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { email, masterPassword, vaultSalt } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const passwordHash = await User.hashPassword(masterPassword);

    const user = await User.create({
      email,
      passwordHash,
      vaultSalt,
    });

    setSessionCookie(user, res);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      user,
      vaultSalt: user.vaultSalt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log in user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, masterPassword } = req.body;

    // Must explicitly select passwordHash since select: false on schema
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or master password.',
      });
    }

    const isMatch = await user.comparePassword(masterPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or master password.',
      });
    }

    setSessionCookie(user, res);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      user,
      vaultSalt: user.vaultSalt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log out user
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  clearSessionCookie(res);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
    vaultSalt: req.user.vaultSalt,
  });
};

/**
 * Update user settings
 * PUT /api/auth/settings
 */
export const updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;

    if (settings) {
      if (typeof settings.autoLockTimeout === 'number') {
        req.user.settings.autoLockTimeout = settings.autoLockTimeout;
      }
      if (typeof settings.theme === 'string') {
        req.user.settings.theme = settings.theme;
      }
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete account and all user data
 * DELETE /api/auth/account
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const { masterPassword } = req.body;

    if (!masterPassword) {
      return res.status(400).json({
        success: false,
        message: 'Master password is required to confirm account deletion.',
      });
    }

    const userWithHash = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await userWithHash.comparePassword(masterPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect master password. Account deletion aborted.',
      });
    }

    // Delete all credentials belonging to this user
    await Credential.deleteMany({ userId: req.user._id });
    // Delete user
    await User.findByIdAndDelete(req.user._id);

    clearSessionCookie(res);

    res.status(200).json({
      success: true,
      message: 'Account and all vault credentials permanently deleted.',
    });
  } catch (error) {
    next(error);
  }
};
