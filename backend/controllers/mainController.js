const asyncHandler = require('express-async-handler');
const Progress = require('../models/Progress');
const Review = require('../models/Review');
const { Wishlist, Notification } = require('../models/Wishlist');
const User = require('../models/User');
const Course = require('../models/Course');
const Order = require('../models/Order');

// ========== PROGRESS ==========

const getProgress = asyncHandler(async (req, res) => {
  const progress = await Progress.findOne({ user: req.user._id, course: req.params.courseId })
    .populate('completedLectures.lecture', 'title type duration')
    .populate('lastWatched.lecture', 'title type');

  res.json({ success: true, progress: progress || null });
});

const updateProgress = asyncHandler(async (req, res) => {
  const { lectureId, watchedDuration, resumeTime } = req.body;

  const course = await Course.findById(req.params.courseId);
  if (!course) { res.status(404); throw new Error('Course not found'); }

  const isEnrolled = course.enrolledStudents.some(s => s.toString() === req.user._id.toString());
  if (!isEnrolled) { res.status(403); throw new Error('Not enrolled in this course'); }

  let progress = await Progress.findOne({ user: req.user._id, course: req.params.courseId });
  if (!progress) {
    progress = new Progress({ user: req.user._id, course: req.params.courseId });
  }

  // Mark lecture complete if not already
  const alreadyCompleted = progress.completedLectures.some(
    l => l.lecture.toString() === lectureId
  );

  if (!alreadyCompleted) {
    progress.completedLectures.push({ lecture: lectureId, watchedDuration });
  }

  // Update last watched
  progress.lastWatched = { lecture: lectureId, watchedAt: new Date(), resumeTime: resumeTime || 0 };

  // Calculate percentage
  progress.progressPercentage = Math.round(
    (progress.completedLectures.length / course.totalLectures) * 100
  );

  // Check completion
  if (progress.progressPercentage >= 100 && !progress.isCompleted) {
    progress.isCompleted = true;
    progress.completedAt = new Date();
    // Issue certificate
    progress.certificateIssued = true;
    progress.certificateUrl = `/certificates/${req.user._id}-${req.params.courseId}`;

    await Notification.create({
      recipient: req.user._id,
      type: 'certificate',
      title: 'Course Completed! 🎉',
      message: `Congratulations! You completed "${course.title}". Your certificate is ready.`,
      link: progress.certificateUrl,
    });
  }

  await progress.save();
  res.json({ success: true, progress });
});

const addNote = asyncHandler(async (req, res) => {
  const { lectureId, content, timestamp } = req.body;
  let progress = await Progress.findOne({ user: req.user._id, course: req.params.courseId });
  if (!progress) { res.status(404); throw new Error('Progress record not found'); }

  progress.notes.push({ lecture: lectureId, content, timestamp });
  await progress.save();
  res.json({ success: true, message: 'Note added', notes: progress.notes });
});

const addBookmark = asyncHandler(async (req, res) => {
  const { lectureId, timestamp, note } = req.body;
  let progress = await Progress.findOne({ user: req.user._id, course: req.params.courseId });
  if (!progress) { res.status(404); throw new Error('Progress record not found'); }

  progress.bookmarks.push({ lecture: lectureId, timestamp, note });
  await progress.save();
  res.json({ success: true, message: 'Bookmark added', bookmarks: progress.bookmarks });
});

// ========== REVIEWS ==========

const getReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const total = await Review.countDocuments({ course: req.params.courseId });
  const reviews = await Review.find({ course: req.params.courseId })
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  res.json({ success: true, total, reviews });
});

const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const course = await Course.findById(req.params.courseId);
  if (!course) { res.status(404); throw new Error('Course not found'); }

  const isEnrolled = course.enrolledStudents.some(s => s.toString() === req.user._id.toString());
  if (!isEnrolled) { res.status(403); throw new Error('You must be enrolled to review this course'); }

  const existing = await Review.findOne({ user: req.user._id, course: req.params.courseId });
  if (existing) { res.status(400); throw new Error('You have already reviewed this course'); }

  const review = await Review.create({
    user: req.user._id,
    course: req.params.courseId,
    rating,
    comment,
    isVerifiedPurchase: true,
  });

  await Notification.create({
    recipient: course.instructor,
    sender: req.user._id,
    type: 'review',
    title: 'New Review',
    message: `A student left a ${rating}-star review on "${course.title}"`,
    link: `/instructor/courses/${course._id}`,
  });

  const io = req.app.get('io');
  if (io) io.to(course.instructor.toString()).emit('notification', { type: 'review', message: 'New review received!' });

  res.status(201).json({ success: true, message: 'Review submitted', review });
});

const updateReview = asyncHandler(async (req, res) => {
  let review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  if (review.user.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, message: 'Review updated', review });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }

  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted' });
});

// ========== WISHLIST ==========

const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate({ path: 'courses.course', populate: { path: 'instructor', select: 'name avatar' } });
  res.json({ success: true, wishlist: wishlist || { courses: [] } });
});

const toggleWishlist = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user._id, courses: [] });
  }

  const idx = wishlist.courses.findIndex(c => c.course.toString() === courseId);
  if (idx > -1) {
    wishlist.courses.splice(idx, 1);
    await wishlist.save();
    return res.json({ success: true, message: 'Removed from wishlist', inWishlist: false });
  } else {
    wishlist.courses.push({ course: courseId });
    await wishlist.save();
    return res.json({ success: true, message: 'Added to wishlist', inWishlist: true });
  }
});

// ========== NOTIFICATIONS ==========

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('sender', 'name avatar')
    .sort('-createdAt')
    .limit(30);

  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
  res.json({ success: true, notifications, unreadCount });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  if (req.params.id === 'all') {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
  } else {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() });
  }
  res.json({ success: true, message: 'Notifications marked as read' });
});

// ========== USER PROFILE ==========

const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, headline, website, socialLinks } = req.body;
  const updateData = { name, bio, headline, website, socialLinks };

  if (req.file) {
    updateData.avatar = { public_id: req.file.public_id, url: req.file.path };
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });
  res.json({ success: true, message: 'Profile updated', user });
});

const getStudentDashboard = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('enrolledCourses', 'title thumbnail slug instructor category');
  const progresses = await Progress.find({ user: req.user._id })
    .populate('course', 'title thumbnail slug totalLectures');

  const completedCourses = progresses.filter(p => p.isCompleted).length;
  const inProgressCourses = progresses.filter(p => !p.isCompleted && p.progressPercentage > 0).length;
  const totalHours = progresses.reduce((sum, p) => sum + (p.completedLectures.length * 10), 0); // estimate

  res.json({
    success: true,
    stats: {
      enrolledCourses: user.enrolledCourses.length,
      completedCourses,
      inProgressCourses,
      totalHoursLearned: totalHours,
    },
    enrolledCourses: user.enrolledCourses,
    progresses,
  });
});

// ========== ADMIN ==========

const getAdminDashboard = asyncHandler(async (req, res) => {
  const [totalUsers, totalCourses, totalOrders, pendingCourses] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Order.countDocuments({ paymentStatus: 'completed' }),
    Course.countDocuments({ status: 'pending' }),
  ]);

  const revenue = await Order.aggregate([
    { $match: { paymentStatus: 'completed' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  const recentOrders = await Order.find({ paymentStatus: 'completed' })
    .populate('user', 'name email')
    .populate('courses.course', 'title')
    .sort('-createdAt').limit(10);

  const monthlyRevenue = await Order.aggregate([
    { $match: { paymentStatus: 'completed' } },
    {
      $group: {
        _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  const topCourses = await Course.find({ status: 'published' })
    .sort('-enrollmentCount').limit(5)
    .populate('instructor', 'name');

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalCourses,
      totalOrders,
      pendingCourses,
      totalRevenue: revenue[0]?.total || 0,
    },
    recentOrders,
    monthlyRevenue,
    topCourses,
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

  const total = await User.countDocuments(query);
  const users = await User.find(query).sort('-createdAt').limit(Number(limit)).skip((Number(page) - 1) * Number(limit));

  res.json({ success: true, total, users });
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
});

const approveCourse = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const course = await Course.findById(req.params.id).populate('instructor', '_id name email');
  if (!course) { res.status(404); throw new Error('Course not found'); }

  course.isApproved = status === 'approved';
  course.status = status === 'approved' ? 'published' : 'rejected';
  await course.save();

  await Notification.create({
    recipient: course.instructor._id,
    type: status === 'approved' ? 'course_approved' : 'course_rejected',
    title: status === 'approved' ? 'Course Approved! 🎉' : 'Course Rejected',
    message: status === 'approved'
      ? `Your course "${course.title}" has been approved and published.`
      : `Your course "${course.title}" was rejected. Reason: ${reason || 'Does not meet guidelines'}`,
    link: `/instructor/courses/${course._id}`,
  });

  res.json({ success: true, message: `Course ${status}`, course });
});

const approveInstructor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'instructor') { res.status(404); throw new Error('Instructor not found'); }

  user.isApproved = !user.isApproved;
  await user.save();

  await Notification.create({
    recipient: user._id,
    type: 'system',
    title: user.isApproved ? 'Instructor Account Approved!' : 'Instructor Status Revoked',
    message: user.isApproved
      ? 'Your instructor account has been approved. You can now create and publish courses.'
      : 'Your instructor status has been revoked.',
  });

  res.json({ success: true, message: `Instructor ${user.isApproved ? 'approved' : 'revoked'}`, user });
});

const getPendingCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ status: 'pending' })
    .populate('instructor', 'name email avatar')
    .sort('-createdAt');
  res.json({ success: true, courses });
});

// ========== INSTRUCTOR ==========

const getInstructorDashboard = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id });
  const courseIds = courses.map(c => c._id);

  const totalStudents = courses.reduce((sum, c) => sum + c.enrollmentCount, 0);
  const publishedCourses = courses.filter(c => c.status === 'published').length;

  const revenue = await Order.aggregate([
    { $match: { paymentStatus: 'completed' } },
    { $unwind: '$courses' },
    { $match: { 'courses.instructor': req.user._id } },
    { $group: { _id: null, total: { $sum: '$courses.price' } } },
  ]);

  const monthlyRevenue = await Order.aggregate([
    { $match: { paymentStatus: 'completed' } },
    { $unwind: '$courses' },
    { $match: { 'courses.instructor': req.user._id } },
    {
      $group: {
        _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
        revenue: { $sum: '$courses.price' },
        enrollments: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  const recentEnrollments = await Order.find({
    paymentStatus: 'completed',
    'courses.instructor': req.user._id,
  })
    .populate('user', 'name email avatar')
    .populate('courses.course', 'title')
    .sort('-paidAt').limit(10);

  res.json({
    success: true,
    stats: {
      totalCourses: courses.length,
      publishedCourses,
      totalStudents,
      totalRevenue: revenue[0]?.total || 0,
    },
    courses,
    monthlyRevenue,
    recentEnrollments,
  });
});

module.exports = {
  // Progress
  getProgress, updateProgress, addNote, addBookmark,
  // Reviews
  getReviews, createReview, updateReview, deleteReview,
  // Wishlist
  getWishlist, toggleWishlist,
  // Notifications
  getNotifications, markNotificationRead,
  // User
  updateProfile, getStudentDashboard,
  // Admin
  getAdminDashboard, getAllUsers, toggleUserStatus, approveCourse, approveInstructor, getPendingCourses,
  // Instructor
  getInstructorDashboard,
};
