# 🎓 StudentHub — Full Stack MERN Learning Platform

A production-ready online learning platform (Udemy/Coursera clone) built with the MERN stack.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, React Router v6, Axios, Recharts |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB, Mongoose |
| Auth | JWT (JSON Web Tokens) |
| File Storage | Cloudinary |
| Payments | Razorpay |
| Email | Nodemailer (Gmail SMTP) |

---

## 📁 Project Structure

```
studenthub/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary + Multer setup
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── lectureController.js
│   │   ├── paymentController.js
│   │   └── mainController.js  # Progress, Review, Wishlist, Admin, Instructor
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT protect + role-based authorize
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Lecture.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   ├── Progress.js
│   │   └── Wishlist.js        # Wishlist + Notification models
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── lectureRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── progressRoutes.js
│   │   ├── wishlistRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── userRoutes.js
│   │   ├── adminRoutes.js
│   │   └── instructorRoutes.js
│   ├── utils/
│   │   ├── sendEmail.js
│   │   └── seeder.js          # Sample data seeder
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── common/
    │   │       ├── Navbar.jsx
    │   │       ├── Footer.jsx
    │   │       ├── CourseCard.jsx
    │   │       └── NotificationDropdown.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── AppContext.jsx  # Theme + Cart
    │   ├── layouts/
    │   │   ├── MainLayout.jsx
    │   │   └── DashboardLayout.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── CoursesPage.jsx
    │   │   ├── CourseDetail.jsx
    │   │   ├── CartPage.jsx
    │   │   ├── auth/
    │   │   │   ├── Login.jsx
    │   │   │   ├── Register.jsx
    │   │   │   ├── ForgotPassword.jsx
    │   │   │   └── ResetPassword.jsx
    │   │   ├── student/
    │   │   │   ├── StudentDashboard.jsx
    │   │   │   ├── MyCourses.jsx
    │   │   │   ├── CourseLearning.jsx
    │   │   │   ├── StudentOrders.jsx
    │   │   │   ├── StudentWishlist.jsx
    │   │   │   └── StudentProfile.jsx
    │   │   ├── instructor/
    │   │   │   ├── InstructorDashboard.jsx
    │   │   │   ├── InstructorCourses.jsx
    │   │   │   ├── CreateCourse.jsx
    │   │   │   ├── EditCourse.jsx
    │   │   │   └── InstructorProfile.jsx
    │   │   └── admin/
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AdminUsers.jsx
    │   │       ├── AdminCourses.jsx
    │   │       └── AdminPending.jsx
    │   ├── services/
    │   │   └── api.js          # Axios instance + all service calls
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── App.jsx
    │   └── index.js
    ├── .env.example
    ├── package.json
    └── tailwind.config.js
```

---

## ⚙️ Prerequisites

Make sure you have these installed:
- **Node.js** v18+ → https://nodejs.org
- **MongoDB** (local) → https://www.mongodb.com/try/download/community  
  OR **MongoDB Atlas** (cloud, free) → https://cloud.mongodb.com
- **npm** v8+

---

## 🛠️ Setup Instructions

### Step 1 — Clone / Navigate to project

```bash
cd studenthub
```

### Step 2 — Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `backend/.env` and fill in:

```env
PORT=5000
NODE_ENV=development

# MongoDB — use either local or Atlas
MONGO_URI=mongodb://localhost:27017/studenthub
# MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/studenthub

# JWT — change this to a long random string
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
JWT_EXPIRE=30d

# Cloudinary (get free account at cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay (get test keys at dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Gmail (use App Password, not your real password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Step 3 — Seed Sample Data

```bash
# From backend/ directory:
npm run seed
```

This creates:
- 1 Admin, 2 Instructors, 2 Students
- 6 sample courses with sections

### Step 4 — Start Backend

```bash
# Development (auto-restart)
npm run dev

# OR Production
npm start
```

Backend runs at: **http://localhost:5000**

---

### Step 5 — Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create frontend `.env`:

```bash
cp .env.example .env
```

`frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 6 — Start Frontend

```bash
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🔑 Demo Login Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@studenthub.com | Admin@123 |
| Instructor | priya@studenthub.com | Instructor@123 |
| Instructor | rahul@studenthub.com | Instructor@123 |
| Student | arjun@studenthub.com | Student@123 |
| Student | sneha@studenthub.com | Student@123 |

---

## 📡 API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me              🔒
POST   /api/auth/forgot-password
PUT    /api/auth/reset-password/:token
PUT    /api/auth/update-password 🔒
```

### Courses
```
GET    /api/courses              (with filters: search, category, level, price, rating, sort, page)
GET    /api/courses/featured
GET    /api/courses/:id
POST   /api/courses              🔒 Instructor
PUT    /api/courses/:id          🔒 Instructor/Admin
DELETE /api/courses/:id          🔒 Instructor/Admin
POST   /api/courses/:id/sections 🔒 Instructor
PUT    /api/courses/:id/publish  🔒 Instructor
GET    /api/courses/instructor/my-courses  🔒 Instructor
```

### Lectures
```
GET    /api/lectures/:id
POST   /api/lectures/:courseId/section/:sectionIndex  🔒 Instructor
PUT    /api/lectures/:id         🔒 Instructor
DELETE /api/lectures/:id         🔒 Instructor
POST   /api/lectures/:id/resources  🔒 Instructor
```

### Payment
```
POST   /api/payment/create-order 🔒
POST   /api/payment/verify       🔒
POST   /api/payment/enroll-free  🔒
GET    /api/payment/orders       🔒
GET    /api/payment/orders/:id   🔒
```

### Reviews
```
GET    /api/reviews/:courseId/reviews
POST   /api/reviews/:courseId/reviews  🔒 Student (enrolled)
PUT    /api/reviews/reviews/:id  🔒
DELETE /api/reviews/reviews/:id  🔒
```

### Progress
```
GET    /api/progress/:courseId   🔒
PUT    /api/progress/:courseId   🔒
POST   /api/progress/:courseId/notes      🔒
POST   /api/progress/:courseId/bookmarks  🔒
```

### Admin (🔒 Admin only)
```
GET    /api/admin/dashboard
GET    /api/admin/users
PUT    /api/admin/users/:id/toggle-status
PUT    /api/admin/users/:id/approve-instructor
GET    /api/admin/courses/pending
PUT    /api/admin/courses/:id/approve
```

---

## 🌟 Features at a Glance

### Student
- Browse & search courses with filters
- Course detail pages with curriculum preview
- Shopping cart & Razorpay payment
- Free course enrollment
- Video player with progress tracking
- Mark lectures complete
- Take notes with video timestamps
- Course completion certificates
- Wishlist management
- Order history
- Star ratings & reviews

### Instructor
- Full course builder (sections + lectures)
- Video/PDF/article uploads via Cloudinary
- Revenue & enrollment analytics with charts
- Course publish/unpublish workflow
- Student enrollment tracking

### Admin
- Platform analytics dashboard (revenue, users, orders)
- Course approval/rejection workflow
- User management (activate/deactivate, approve instructors)
- Revenue charts with Recharts

### General
- Dark / Light mode toggle
- Real-time notifications via Socket.IO
- JWT authentication with refresh
- Forgot/reset password via email
- Responsive design (mobile-first)
- Skeleton loading states
- Toast notifications

---

## 🔧 Troubleshooting

**MongoDB connection error:**
```bash
# Start MongoDB locally
mongod --dbpath /data/db
# Or use MongoDB Atlas free tier
```

**Port already in use:**
```bash
# Kill process on port 5000
npx kill-port 5000
```

**npm install fails:**
```bash
npm install --legacy-peer-deps
```

**Cloudinary uploads not working:**
- Ensure credentials in `.env` are correct
- Check Cloudinary free tier limits (25GB)

**Razorpay test mode:**
- Use test key IDs starting with `rzp_test_`
- Use test card: 4111 1111 1111 1111, any future date, any CVV

---

## 🚢 Production Deployment

### Backend (Railway / Render / Heroku)
1. Set all environment variables in the platform dashboard
2. Set `NODE_ENV=production`
3. Deploy the `backend/` folder

### Frontend (Vercel / Netlify)
1. Build: `npm run build`
2. Set `REACT_APP_API_URL=https://your-backend.railway.app/api`
3. Deploy the `frontend/` folder

---

## 📄 License

This project is developed by Shubham as a personal/academic project.
All rights reserved.

---

Built with ❤️ using the MERN Stack
