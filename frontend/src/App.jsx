import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, CartProvider } from './context/AppContext';

// Socket hook for real-time notifications
import { useSocket } from './hooks/useSocket';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import CoursesPage from './pages/CoursesPage';
import CourseDetail from './pages/CourseDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import CartPage from './pages/CartPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyCourses from './pages/student/MyCourses';
import CourseLearning from './pages/student/CourseLearning';
import StudentOrders from './pages/student/StudentOrders';
import StudentWishlist from './pages/student/StudentWishlist';
import StudentProfile from './pages/student/StudentProfile';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorCourses from './pages/instructor/InstructorCourses';
import CreateCourse from './pages/instructor/CreateCourse';
import EditCourse from './pages/instructor/EditCourse';
import InstructorProfile from './pages/instructor/InstructorProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminPending from './pages/admin/AdminPending';

// Protected route component
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

// Role redirect after login
const RoleRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'instructor') return <Navigate to="/instructor/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};


// Component that initializes socket connection when user is logged in
function SocketInitializer() {
  useSocket(); // Connects & listens for real-time notifications
  return null;
}

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <AuthProvider>
          <Router>
            <SocketInitializer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: { fontFamily: 'Outfit, sans-serif', borderRadius: '12px', padding: '12px 16px' },
                success: { iconTheme: { primary: '#0ea5e9', secondary: '#fff' } },
              }}
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="courses/:id" element={<CourseDetail />} />
                <Route path="cart" element={<CartPage />} />
              </Route>

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/dashboard" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

              {/* Student Routes */}
              <Route path="/student" element={<ProtectedRoute roles={['student']}><DashboardLayout role="student" /></ProtectedRoute>}>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="my-courses" element={<MyCourses />} />
                <Route path="learn/:courseId" element={<CourseLearning />} />
                <Route path="orders" element={<StudentOrders />} />
                <Route path="wishlist" element={<StudentWishlist />} />
                <Route path="profile" element={<StudentProfile />} />
              </Route>

              {/* Instructor Routes */}
              <Route path="/instructor" element={<ProtectedRoute roles={['instructor']}><DashboardLayout role="instructor" /></ProtectedRoute>}>
                <Route path="dashboard" element={<InstructorDashboard />} />
                <Route path="courses" element={<InstructorCourses />} />
                <Route path="courses/create" element={<CreateCourse />} />
                <Route path="courses/:id/edit" element={<EditCourse />} />
                <Route path="profile" element={<InstructorProfile />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout role="admin" /></ProtectedRoute>}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="pending" element={<AdminPending />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
