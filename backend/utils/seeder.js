const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Course = require('../models/Course');
const Review = require('../models/Review');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected for seeding...');
};

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Course.deleteMany({});
  await Review.deleteMany({});

  console.log('Cleared existing data...');

  // Create admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@studenthub.com',
    password: 'Admin@123',
    role: 'admin',
    isApproved: true,
    isActive: true,
  });

  // Create instructors
  const instructor1 = await User.create({
    name: 'Dr. Priya Sharma',
    email: 'priya@studenthub.com',
    password: 'Instructor@123',
    role: 'instructor',
    isApproved: true,
    isActive: true,
    headline: 'Full Stack Developer & Educator | 10+ Years Experience',
    bio: 'Passionate about teaching web development. I have trained over 50,000 students worldwide.',
  });

  const instructor2 = await User.create({
    name: 'Rahul Verma',
    email: 'rahul@studenthub.com',
    password: 'Instructor@123',
    role: 'instructor',
    isApproved: true,
    isActive: true,
    headline: 'Data Scientist | ML Engineer | AI Enthusiast',
    bio: 'Expert in Python, Machine Learning, and Data Science with 8 years of industry experience.',
  });

  // Create students
  const student1 = await User.create({
    name: 'Arjun Patel',
    email: 'arjun@studenthub.com',
    password: 'Student@123',
    role: 'student',
    isApproved: true,
    isActive: true,
  });

  const student2 = await User.create({
    name: 'Sneha Gupta',
    email: 'sneha@studenthub.com',
    password: 'Student@123',
    role: 'student',
    isApproved: true,
    isActive: true,
  });

  console.log('Users created...');

  // Create courses
  const courses = await Course.insertMany([
    {
      title: 'Complete React & Node.js Full Stack Bootcamp',
      slug: 'complete-react-nodejs-fullstack-bootcamp-' + Date.now(),
      description: 'Master React.js, Node.js, Express, MongoDB in this comprehensive bootcamp. Build 10+ real-world projects and land your dream job as a Full Stack Developer.',
      shortDescription: 'The most complete MERN stack course with hands-on projects',
      instructor: instructor1._id,
      category: 'Web Development',
      level: 'Beginner',
      language: 'English',
      price: 2999,
      discountPrice: 499,
      thumbnail: { url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800' },
      status: 'published',
      isApproved: true,
      isFeatured: true,
      isBestseller: true,
      enrolledStudents: [student1._id, student2._id],
      enrollmentCount: 12450,
      ratings: { average: 4.8, count: 3200 },
      totalLectures: 182,
      totalDuration: 4680,
      whatYouLearn: ['React.js from scratch', 'Node.js & Express.js', 'MongoDB & Mongoose', 'REST API design', 'JWT Authentication', 'Deploy to production'],
      requirements: ['Basic JavaScript knowledge', 'HTML & CSS basics'],
      tags: ['react', 'nodejs', 'mongodb', 'javascript', 'fullstack'],
      sections: [
        { title: 'Introduction to MERN Stack', description: 'Overview', order: 0, lectures: [] },
        { title: 'React Fundamentals', description: 'Core React concepts', order: 1, lectures: [] },
        { title: 'Backend with Node.js', description: 'Server-side development', order: 2, lectures: [] },
      ],
    },
    {
      title: 'Python for Data Science & Machine Learning',
      slug: 'python-data-science-ml-' + Date.now(),
      description: 'Learn Python, NumPy, Pandas, Matplotlib, Seaborn, Scikit-Learn, TensorFlow and more! Build ML models from scratch and deploy them.',
      shortDescription: 'Comprehensive Data Science course with Python and ML algorithms',
      instructor: instructor2._id,
      category: 'Data Science',
      level: 'Intermediate',
      language: 'English',
      price: 3499,
      discountPrice: 599,
      thumbnail: { url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800' },
      status: 'published',
      isApproved: true,
      isFeatured: true,
      enrolledStudents: [student1._id],
      enrollmentCount: 8920,
      ratings: { average: 4.7, count: 2100 },
      totalLectures: 145,
      totalDuration: 3600,
      whatYouLearn: ['Python programming', 'Data Analysis with Pandas', 'Machine Learning algorithms', 'Deep Learning with TensorFlow'],
      requirements: ['Basic programming knowledge', 'High school mathematics'],
      tags: ['python', 'data science', 'machine learning', 'ai'],
      sections: [
        { title: 'Python Basics', order: 0, lectures: [] },
        { title: 'NumPy & Pandas', order: 1, lectures: [] },
        { title: 'Machine Learning', order: 2, lectures: [] },
      ],
    },
    {
      title: 'UI/UX Design Masterclass with Figma',
      slug: 'ui-ux-design-figma-masterclass-' + Date.now(),
      description: 'Learn UI/UX Design from scratch using Figma. Design beautiful apps, create wireframes, prototypes, and build a professional portfolio.',
      shortDescription: 'Complete UI/UX Design course using Figma',
      instructor: instructor1._id,
      category: 'UI/UX Design',
      level: 'Beginner',
      language: 'English',
      price: 1999,
      discountPrice: 399,
      thumbnail: { url: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800' },
      status: 'published',
      isApproved: true,
      enrolledStudents: [student2._id],
      enrollmentCount: 5600,
      ratings: { average: 4.9, count: 1800 },
      totalLectures: 98,
      totalDuration: 2400,
      whatYouLearn: ['Figma basics to advanced', 'User Research methods', 'Wireframing & Prototyping', 'Design Systems'],
      requirements: ['No prior design experience needed'],
      tags: ['figma', 'ui design', 'ux design', 'prototyping'],
      sections: [
        { title: 'Design Fundamentals', order: 0, lectures: [] },
        { title: 'Figma Tools', order: 1, lectures: [] },
      ],
    },
    {
      title: 'DevOps & Cloud Engineering with AWS',
      slug: 'devops-aws-cloud-engineering-' + Date.now(),
      description: 'Master DevOps practices: Docker, Kubernetes, CI/CD pipelines, AWS services, Terraform, and more. Become a cloud engineer.',
      shortDescription: 'Complete DevOps course with Docker, K8s, AWS',
      instructor: instructor2._id,
      category: 'DevOps',
      level: 'Advanced',
      language: 'English',
      price: 4999,
      discountPrice: 799,
      thumbnail: { url: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800' },
      status: 'published',
      isApproved: true,
      enrolledStudents: [],
      enrollmentCount: 3200,
      ratings: { average: 4.6, count: 980 },
      totalLectures: 210,
      totalDuration: 5400,
      whatYouLearn: ['Docker & Kubernetes', 'AWS services', 'CI/CD with GitHub Actions', 'Terraform IaC'],
      requirements: ['Linux basics', 'Some programming experience'],
      tags: ['devops', 'aws', 'docker', 'kubernetes', 'cloud'],
      sections: [
        { title: 'Linux & Shell Scripting', order: 0, lectures: [] },
        { title: 'Docker & Containers', order: 1, lectures: [] },
        { title: 'Kubernetes', order: 2, lectures: [] },
      ],
    },
    {
      title: 'Digital Marketing & SEO Masterclass',
      slug: 'digital-marketing-seo-masterclass-' + Date.now(),
      description: 'Learn Digital Marketing, SEO, Social Media Marketing, Google Ads, Facebook Ads, Email Marketing and grow any business online.',
      shortDescription: 'Complete digital marketing course for beginners to advanced',
      instructor: instructor1._id,
      category: 'Digital Marketing',
      level: 'All Levels',
      language: 'English',
      price: 1499,
      discountPrice: 299,
      thumbnail: { url: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800' },
      status: 'published',
      isApproved: true,
      enrolledStudents: [student1._id, student2._id],
      enrollmentCount: 7800,
      ratings: { average: 4.5, count: 2400 },
      totalLectures: 120,
      totalDuration: 3000,
      whatYouLearn: ['SEO fundamentals', 'Google & Facebook Ads', 'Social Media Strategy', 'Email Marketing'],
      requirements: ['No prior marketing knowledge needed'],
      tags: ['digital marketing', 'seo', 'social media', 'google ads'],
      sections: [
        { title: 'Marketing Fundamentals', order: 0, lectures: [] },
        { title: 'SEO & Content Marketing', order: 1, lectures: [] },
      ],
    },
    {
      title: 'Mobile App Development with React Native',
      slug: 'react-native-mobile-dev-' + Date.now(),
      description: 'Build cross-platform iOS and Android apps with React Native. Learn Expo, React Navigation, State Management, and publish to app stores.',
      shortDescription: 'Build iOS & Android apps with React Native',
      instructor: instructor2._id,
      category: 'Mobile Development',
      level: 'Intermediate',
      language: 'English',
      price: 2499,
      discountPrice: 449,
      thumbnail: { url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800' },
      status: 'published',
      isApproved: true,
      enrolledStudents: [],
      enrollmentCount: 4100,
      ratings: { average: 4.7, count: 1200 },
      totalLectures: 160,
      totalDuration: 4000,
      whatYouLearn: ['React Native basics', 'Navigation & Routing', 'State Management', 'App Store publishing'],
      requirements: ['Basic React.js knowledge'],
      tags: ['react native', 'mobile development', 'ios', 'android'],
      sections: [
        { title: 'React Native Basics', order: 0, lectures: [] },
        { title: 'Building Apps', order: 1, lectures: [] },
      ],
    },
  ]);

  // Update instructor enrolled courses
  await User.findByIdAndUpdate(student1._id, {
    enrolledCourses: [courses[0]._id, courses[1]._id, courses[4]._id],
  });
  await User.findByIdAndUpdate(student2._id, {
    enrolledCourses: [courses[0]._id, courses[2]._id, courses[4]._id],
  });

  console.log('Courses created...');
  console.log('\n✅ Seeding complete!\n');
  console.log('=== LOGIN CREDENTIALS ===');
  console.log('Admin:      admin@studenthub.com     / Admin@123');
  console.log('Instructor: priya@studenthub.com     / Instructor@123');
  console.log('Instructor: rahul@studenthub.com     / Instructor@123');
  console.log('Student:    arjun@studenthub.com     / Student@123');
  console.log('Student:    sneha@studenthub.com     / Student@123');

  process.exit(0);
};

seedData().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
