import axios from 'axios';

const rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const baseURL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('shToken');
      localStorage.removeItem('shUser');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Course services
export const courseService = {
  getAll: (params) => api.get('/courses', { params }),
  getFeatured: () => api.get('/courses/featured'),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/courses/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/courses/${id}`),
  addSection: (id, data) => api.post(`/courses/${id}/sections`, data),
  togglePublish: (id) => api.put(`/courses/${id}/publish`),
  getMyCourses: () => api.get('/courses/instructor/my-courses'),
};

// Lecture services
export const lectureService = {
  get: (id) => api.get(`/lectures/${id}`),
  add: (courseId, sectionIndex, data) =>
    api.post(`/lectures/${courseId}/section/${sectionIndex}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/lectures/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/lectures/${id}`),
};

// Payment services
export const paymentService = {
  createOrder: (courseIds) => api.post('/payment/create-order', { courseIds }),
  verify: (data) => api.post('/payment/verify', data),
  enrollFree: (courseId) => api.post('/payment/enroll-free', { courseId }),
  getOrders: () => api.get('/payment/orders'),
  getOrder: (id) => api.get(`/payment/orders/${id}`),
};

// Review services
export const reviewService = {
  get: (courseId, params) => api.get(`/reviews/${courseId}/reviews`, { params }),
  create: (courseId, data) => api.post(`/reviews/${courseId}/reviews`, data),
  update: (id, data) => api.put(`/reviews/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/reviews/${id}`),
};

// Progress services
export const progressService = {
  get: (courseId) => api.get(`/progress/${courseId}`),
  update: (courseId, data) => api.put(`/progress/${courseId}`, data),
  addNote: (courseId, data) => api.post(`/progress/${courseId}/notes`, data),
  addBookmark: (courseId, data) => api.post(`/progress/${courseId}/bookmarks`, data),
};

// Wishlist services
export const wishlistService = {
  get: () => api.get('/wishlist'),
  toggle: (courseId) => api.post('/wishlist/toggle', { courseId }),
};

// Notification services
export const notificationService = {
  get: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};

// User services
export const userService = {
  updateProfile: (data) => api.put('/users/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getDashboard: () => api.get('/users/dashboard'),
};

// Admin services
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  approveInstructor: (id) => api.put(`/admin/users/${id}/approve-instructor`),
  getPendingCourses: () => api.get('/admin/courses/pending'),
  approveCourse: (id, data) => api.put(`/admin/courses/${id}/approve`, data),
};

// Instructor services
export const instructorService = {
  getDashboard: () => api.get('/instructor/dashboard'),
};

// Platform stats services
export const statsService = {
  getStats: () => api.get('/stats'),
};
