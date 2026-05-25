const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');
const Lecture = require('../models/Lecture');
const User = require('../models/User');
const { Notification } = require('../models/Wishlist');

// @desc    Get all published courses
// @route   GET /api/courses
// @access  Public
const getCourses = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    level,
    minPrice,
    maxPrice,
    rating,
    search,
    sort = '-createdAt',
    instructor,
    language,
  } = req.query;

  const query = { status: 'published', isApproved: true };

  if (category) query.category = category;
  if (level) query.level = level;
  if (language) query.language = language;
  if (instructor) query.instructor = instructor;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (rating) query['ratings.average'] = { $gte: Number(rating) };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .populate('instructor', 'name avatar headline')
    .select('-sections')
    .sort(sort)
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    courses,
  });
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    $or: [{ _id: req.params.id }, { slug: req.params.id }],
  })
    .populate('instructor', 'name avatar bio headline website socialLinks enrolledCourses')
    .populate({
      path: 'sections.lectures',
      model: 'Lecture',
      select: 'title type isFree duration order',
    });

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  res.json({ success: true, course });
});

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Instructor)
const createCourse = asyncHandler(async (req, res) => {
  const {
    title, description, shortDescription, category, level,
    language, price, discountPrice, requirements, whatYouLearn,
    targetAudience, tags,
  } = req.body;

  const course = await Course.create({
    title,
    description,
    shortDescription,
    category,
    level,
    language,
    price,
    discountPrice,
    requirements: requirements ? JSON.parse(requirements) : [],
    whatYouLearn: whatYouLearn ? JSON.parse(whatYouLearn) : [],
    targetAudience: targetAudience ? JSON.parse(targetAudience) : [],
    tags: tags ? JSON.parse(tags) : [],
    instructor: req.user._id,
    thumbnail: req.file ? { public_id: req.file.public_id, url: req.file.path } : undefined,
  });

  res.status(201).json({ success: true, message: 'Course created successfully', course });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor/Admin)
const updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Ownership check (not admin)
  if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this course');
  }

  const updateData = { ...req.body };
  if (req.file) {
    updateData.thumbnail = { public_id: req.file.public_id, url: req.file.path };
  }
  // Parse JSON strings
  ['requirements', 'whatYouLearn', 'targetAudience', 'tags'].forEach((field) => {
    if (updateData[field] && typeof updateData[field] === 'string') {
      try { updateData[field] = JSON.parse(updateData[field]); } catch {}
    }
  });

  // Reset approval when content changes
  if (req.user.role !== 'admin') {
    updateData.isApproved = false;
    updateData.status = 'pending';
  }

  course = await Course.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, message: 'Course updated successfully', course });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin)
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this course');
  }

  await course.deleteOne();
  res.json({ success: true, message: 'Course deleted successfully' });
});

// @desc    Add section to course
// @route   POST /api/courses/:id/sections
// @access  Private (Instructor)
const addSection = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const { title, description } = req.body;
  course.sections.push({ title, description, order: course.sections.length, lectures: [] });
  await course.save();

  res.status(201).json({ success: true, message: 'Section added', course });
});

// @desc    Get instructor courses
// @route   GET /api/courses/instructor/my-courses
// @access  Private (Instructor)
const getInstructorCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id })
    .populate('instructor', 'name avatar')
    .sort('-createdAt');

  res.json({ success: true, courses });
});

// @desc    Publish/Unpublish course
// @route   PUT /api/courses/:id/publish
// @access  Private (Instructor)
const togglePublish = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (course.status === 'published') {
    course.status = 'draft';
  } else {
    course.status = 'pending'; // Needs admin approval
  }

  await course.save();
  res.json({ success: true, message: `Course ${course.status === 'draft' ? 'unpublished' : 'submitted for review'}`, course });
});

// @desc    Get featured/popular courses
// @route   GET /api/courses/featured
// @access  Public
const getFeaturedCourses = asyncHandler(async (req, res) => {
  const featured = await Course.find({ status: 'published', isApproved: true, isFeatured: true })
    .populate('instructor', 'name avatar')
    .select('-sections')
    .limit(8);

  const popular = await Course.find({ status: 'published', isApproved: true })
    .populate('instructor', 'name avatar')
    .select('-sections')
    .sort('-enrollmentCount')
    .limit(8);

  const newest = await Course.find({ status: 'published', isApproved: true })
    .populate('instructor', 'name avatar')
    .select('-sections')
    .sort('-createdAt')
    .limit(8);

  res.json({ success: true, featured, popular, newest });
});

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addSection,
  getInstructorCourses,
  togglePublish,
  getFeaturedCourses,
};
