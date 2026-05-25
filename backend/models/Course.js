const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  order: { type: Number, default: 0 },
  lectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }],
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [200, 'Short description cannot exceed 200 characters'],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Web Development',
        'Mobile Development',
        'Data Science',
        'Machine Learning',
        'DevOps',
        'Cybersecurity',
        'UI/UX Design',
        'Digital Marketing',
        'Business',
        'Photography',
        'Music',
        'Health & Fitness',
        'Language',
        'Other',
      ],
    },
    subCategory: String,
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'All Levels',
    },
    language: { type: String, default: 'English' },
    thumbnail: {
      public_id: String,
      url: { type: String, default: 'https://via.placeholder.com/800x450?text=Course+Thumbnail' },
    },
    previewVideo: {
      public_id: String,
      url: String,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    currency: { type: String, default: 'INR' },
    sections: [sectionSchema],
    totalDuration: { type: Number, default: 0 }, // in minutes
    totalLectures: { type: Number, default: 0 },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    enrollmentCount: { type: Number, default: 0 },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    requirements: [String],
    whatYouLearn: [String],
    targetAudience: [String],
    tags: [String],
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'rejected', 'archived'],
      default: 'draft',
    },
    isApproved: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    lastUpdated: Date,
  },
  { timestamps: true }
);

// Generate slug before saving
courseSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-') + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);
