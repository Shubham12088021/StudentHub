const asyncHandler = require("express-async-handler");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const Course = require("../models/Course");
const User = require("../models/User");
const Progress = require("../models/Progress");
const { Notification } = require("../models/Wishlist");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private (Student)
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { courseIds } = req.body;

  const courses = await Course.find({
    _id: { $in: courseIds },
    status: "published",
    isApproved: true,
  }).populate("instructor", "_id");

  if (courses.length !== courseIds.length) {
    res.status(400);
    throw new Error("One or more courses are unavailable");
  }

  // Check if already enrolled
  const alreadyEnrolled = courses.filter((c) =>
    c.enrolledStudents.some((s) => s.toString() === req.user._id.toString()),
  );
  if (alreadyEnrolled.length > 0) {
    res.status(400);
    throw new Error(
      `You are already enrolled in: ${alreadyEnrolled.map((c) => c.title).join(", ")}`,
    );
  }

  const totalAmount = courses.reduce(
    (sum, c) => sum + (c.discountPrice || c.price),
    0,
  );
  const amountInPaise = Math.round(totalAmount * 100);

  const razorpayOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    notes: { userId: req.user._id.toString(), courseIds: courseIds.join(",") },
  });

  // Create pending order in DB
  const order = await Order.create({
    user: req.user._id,
    courses: courses.map((c) => ({
      course: c._id,
      price: c.discountPrice || c.price,
      instructor: c.instructor._id,
    })),
    totalAmount,
    paymentMethod: "razorpay",
    paymentStatus: "pending",
    razorpay: { orderId: razorpayOrder.id },
  });

  res.json({
    success: true,
    razorpayOrderId: razorpayOrder.id,
    amount: amountInPaise,
    currency: "INR",
    orderId: order._id,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  // Verify signature
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest("hex");

  if (
    process.env.NODE_ENV === "production" &&
    expectedSign !== razorpay_signature
  ) {
    res.status(400);
    throw new Error("Payment verification failed - invalid signature");
  }

  const order = await Order.findById(orderId).populate("courses.course");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Update order
  order.paymentStatus = "completed";
  order.paidAt = new Date();
  order.razorpay.paymentId = razorpay_payment_id;
  order.razorpay.signature = razorpay_signature;
  await order.save();

  // Enroll student in courses and initialize progress
  for (const item of order.courses) {
    const course = await Course.findById(item.course._id || item.course);
    if (course) {
      const isAlreadyEnrolled = course.enrolledStudents.some(
        (s) => s.toString() === req.user._id.toString()
      );
      if (!isAlreadyEnrolled) {
        course.enrolledStudents.push(req.user._id);
        course.enrollmentCount += 1;
        await course.save();
      }

      // Initialize progress tracking
      await Progress.findOneAndUpdate(
        { user: req.user._id, course: course._id },
        { user: req.user._id, course: course._id },
        { upsert: true, new: true },
      );

      // Update instructor earnings
      const instructorShare = (item.price || course.price) * 0.7; // 70% to instructor
      await User.findByIdAndUpdate(item.instructor, {
        $inc: { earnings: instructorShare },
      });

      // Send notification to instructor
      await Notification.create({
        recipient: item.instructor,
        sender: req.user._id,
        type: "enrollment",
        title: "New Student Enrolled",
        message: `A student enrolled in "${course.title}"`,
        link: `/instructor/courses/${course._id}`,
      });
    }
  }

  // Add courses to student's enrolled list
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: {
      enrolledCourses: {
        $each: order.courses.map((c) => c.course._id || c.course),
      },
    },
  });

  // Notify student
  await Notification.create({
    recipient: req.user._id,
    type: "payment_success",
    title: "Enrollment Successful!",
    message: `You have successfully enrolled in ${order.courses.length} course(s).`,
    link: "/student/my-courses",
  });

  // Emit socket notification
  const io = req.app.get("io");
  if (io) {
    io.to(req.user._id.toString()).emit("notification", {
      type: "payment_success",
      message: "Enrollment successful!",
    });
  }

  res.json({
    success: true,
    message: "Payment verified and enrollment successful",
    order,
  });
});

// @desc    Free course enrollment
// @route   POST /api/payment/enroll-free
// @access  Private
const enrollFree = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }
  if (course.price > 0) {
    res.status(400);
    throw new Error("This is not a free course");
  }

  const isEnrolled = course.enrolledStudents.some(
    (s) => s.toString() === req.user._id.toString()
  );
  if (isEnrolled) {
    res.status(400);
    throw new Error("Already enrolled in this course");
  }

  course.enrolledStudents.push(req.user._id);
  course.enrollmentCount += 1;
  await course.save();

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { enrolledCourses: courseId },
  });

  await Progress.findOneAndUpdate(
    { user: req.user._id, course: courseId },
    { user: req.user._id, course: courseId },
    { upsert: true, new: true },
  );

  // Create free order record
  await Order.create({
    user: req.user._id,
    courses: [{ course: courseId, price: 0, instructor: course.instructor }],
    totalAmount: 0,
    paymentMethod: "free",
    paymentStatus: "completed",
    paidAt: new Date(),
  });

  res.json({ success: true, message: "Successfully enrolled in free course" });
});

// @desc    Get order history
// @route   GET /api/payment/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
    paymentStatus: "completed",
  })
    .populate("courses.course", "title thumbnail slug instructor")
    .sort("-createdAt");

  res.json({ success: true, orders });
});

// @desc    Get single order / invoice
// @route   GET /api/payment/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("courses.course", "title thumbnail instructor")
    .populate("courses.instructor", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  res.json({ success: true, order });
});

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  enrollFree,
  getOrders,
  getOrder,
};
