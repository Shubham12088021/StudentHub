const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lecture title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: String,
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    section: String, // Section title reference
    order: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ['video', 'pdf', 'article', 'quiz'],
      default: 'video',
    },
    video: {
      public_id: String,
      url: String,
      duration: { type: Number, default: 0 }, // in seconds
      thumbnailUrl: String,
    },
    content: String, // For article type
    resources: [
      {
        title: String,
        type: { type: String, enum: ['pdf', 'doc', 'zip', 'link'] },
        url: String,
        public_id: String,
        size: Number,
      },
    ],
    notes: String,
    isFree: { type: Boolean, default: false }, // Preview lecture
    isPublished: { type: Boolean, default: true },
    duration: { type: Number, default: 0 }, // in minutes
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lecture', lectureSchema);
