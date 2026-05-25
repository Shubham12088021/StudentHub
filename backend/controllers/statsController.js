const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Course = require('../models/Course');
const Order = require('../models/Order');

// @desc    Get public platform stats for homepage
// @route   GET /api/stats
// @access  Public
const getPlatformStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalCourses, totalOrders] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Course.countDocuments({ status: 'published', isApproved: true }),
    Order.countDocuments({ paymentStatus: 'completed' }),
  ]);

  const revenueResult = await Order.aggregate([
    { $match: { paymentStatus: 'completed' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  res.json({
    success: true,
    stats: {
      totalStudents: totalUsers,
      totalCourses,
      totalOrders,
      totalRevenue: revenueResult[0]?.total || 0,
    },
  });
});

module.exports = { getPlatformStats };
