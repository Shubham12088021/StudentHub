const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    isVerifiedPurchase: { type: Boolean, default: false },
    helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    instructorReply: {
      comment: String,
      repliedAt: Date,
    },
  },
  { timestamps: true }
);

// One review per user per course
reviewSchema.index({ user: 1, course: 1 }, { unique: true });

// Update course rating after save/remove
reviewSchema.post('save', async function () {
  await updateCourseRating(this.course);
});

reviewSchema.post('remove', async function () {
  await updateCourseRating(this.course);
});

async function updateCourseRating(courseId) {
  const Review = mongoose.model('Review');
  const Course = mongoose.model('Course');
  const stats = await Review.aggregate([
    { $match: { course: courseId } },
    {
      $group: {
        _id: '$course',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      'ratings.average': Math.round(stats[0].avgRating * 10) / 10,
      'ratings.count': stats[0].count,
    });
  } else {
    await Course.findByIdAndUpdate(courseId, {
      'ratings.average': 0,
      'ratings.count': 0,
    });
  }
}

module.exports = mongoose.model('Review', reviewSchema);
