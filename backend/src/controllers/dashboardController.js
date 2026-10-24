import Credential from '../models/Credential.js';
import mongoose from 'mongoose';

/**
 * Get dashboard metrics for authenticated user
 * GET /api/dashboard
 */
export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [total, favorites, categories] = await Promise.all([
      Credential.countDocuments({ userId }),
      Credential.countDocuments({ userId, isFavorite: true }),
      Credential.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    const recent = await Credential.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title url username category isFavorite updatedAt');

    res.status(200).json({
      success: true,
      data: {
        total,
        favorites,
        categories: categories.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        recent,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * System and database health status
 * GET /api/health
 */
export const getHealth = async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    status: 'UP',
    service: 'PassVault REST API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
  });
};
