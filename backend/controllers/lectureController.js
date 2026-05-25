const asyncHandler = require('express-async-handler');
const Lecture = require('../models/Lecture');
const Course = require('../models/Course');

// @desc    Add lecture to course section
// @route   POST /api/lectures/:courseId/section/:sectionIndex
// @access  Private (Instructor)
const addLecture = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) { res.status(404); throw new Error('Course not found'); }

  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }

  const { title, description, type, notes, isFree, content } = req.body;
  const sectionIndex = Number(req.params.sectionIndex);

  if (!course.sections[sectionIndex]) {
    res.status(404); throw new Error('Section not found');
  }

  const lectureData = {
    title,
    description,
    course: course._id,
    section: course.sections[sectionIndex].title,
    type: type || 'video',
    notes,
    isFree: isFree === 'true',
    content,
    order: course.sections[sectionIndex].lectures.length,
  };

  // Handle video upload
  if (req.file && type === 'video') {
    lectureData.video = {
      public_id: req.file.public_id,
      url: req.file.path,
      duration: 0,
    };
    lectureData.duration = 0;
  }

  const lecture = await Lecture.create(lectureData);

  // Add lecture to section
  course.sections[sectionIndex].lectures.push(lecture._id);
  course.totalLectures = course.sections.reduce((acc, s) => acc + s.lectures.length, 0);
  await course.save();

  res.status(201).json({ success: true, message: 'Lecture added successfully', lecture });
});

// @desc    Get lecture by ID (with enrollment check)
// @route   GET /api/lectures/:id
// @access  Private
const getLecture = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id).populate('course', 'title enrolledStudents instructor');
  if (!lecture) { res.status(404); throw new Error('Lecture not found'); }

  const course = lecture.course;
  const isEnrolled = course.enrolledStudents.some(s => s.toString() === req.user._id.toString());
  const isInstructor = course.instructor.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!lecture.isFree && !isEnrolled && !isInstructor && !isAdmin) {
    res.status(403); throw new Error('Please enroll in this course to access this lecture');
  }

  res.json({ success: true, lecture });
});

// @desc    Update lecture
// @route   PUT /api/lectures/:id
// @access  Private (Instructor)
const updateLecture = asyncHandler(async (req, res) => {
  let lecture = await Lecture.findById(req.params.id).populate('course', 'instructor');
  if (!lecture) { res.status(404); throw new Error('Lecture not found'); }

  if (lecture.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }

  const updateData = { ...req.body };
  if (req.file) {
    updateData.video = { public_id: req.file.public_id, url: req.file.path, duration: 0 };
  }

  lecture = await Lecture.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
  res.json({ success: true, message: 'Lecture updated', lecture });
});

// @desc    Delete lecture
// @route   DELETE /api/lectures/:id
// @access  Private (Instructor)
const deleteLecture = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id).populate('course', 'instructor sections');
  if (!lecture) { res.status(404); throw new Error('Lecture not found'); }

  if (lecture.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }

  // Remove from course section
  const course = await Course.findById(lecture.course._id);
  course.sections.forEach(section => {
    section.lectures = section.lectures.filter(l => l.toString() !== lecture._id.toString());
  });
  course.totalLectures = Math.max(0, course.totalLectures - 1);
  await course.save();

  await lecture.deleteOne();
  res.json({ success: true, message: 'Lecture deleted' });
});

// @desc    Add resource to lecture
// @route   POST /api/lectures/:id/resources
// @access  Private (Instructor)
const addResource = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id).populate('course', 'instructor');
  if (!lecture) { res.status(404); throw new Error('Lecture not found'); }

  if (lecture.course.instructor.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }

  const { title, type, url } = req.body;
  const resource = { title, type, url };

  if (req.file) {
    resource.url = req.file.path;
    resource.public_id = req.file.public_id;
    resource.size = req.file.size;
  }

  lecture.resources.push(resource);
  await lecture.save();

  res.status(201).json({ success: true, message: 'Resource added', lecture });
});

module.exports = { addLecture, getLecture, updateLecture, deleteLecture, addResource };
