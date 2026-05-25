const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
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
    completedLectures: [
      {
        lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' },
        completedAt: { type: Date, default: Date.now },
        watchedDuration: Number, // seconds watched
      },
    ],
    lastWatched: {
      lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' },
      watchedAt: Date,
      resumeTime: Number, // seconds to resume from
    },
    progressPercentage: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    certificateIssued: { type: Boolean, default: false },
    certificateUrl: String,
    notes: [
      {
        lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' },
        content: String,
        timestamp: Number, // video timestamp in seconds
        createdAt: { type: Date, default: Date.now },
      },
    ],
    bookmarks: [
      {
        lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' },
        timestamp: Number,
        note: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
