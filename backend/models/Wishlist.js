const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    courses: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'enrollment',
        'review',
        'course_approved',
        'course_rejected',
        'payment_success',
        'new_lecture',
        'announcement',
        'certificate',
        'system',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: String,
    isRead: { type: Boolean, default: false },
    readAt: Date,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Wishlist, Notification };
