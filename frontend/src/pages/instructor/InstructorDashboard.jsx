import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { instructorService } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BookOpen, Users, DollarSign, TrendingUp, Plus, ArrowRight } from 'lucide-react';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function InstructorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    instructorService.getDashboard()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="skeleton h-72 rounded-2xl" />
    </div>
  );

  const stats = data?.stats || {};
  const monthlyRevenue = (data?.monthlyRevenue || []).map(m => ({
    name: MONTH_NAMES[m._id.month - 1],
    revenue: m.revenue,
    enrollments: m.enrollments,
  }));

  const courses = data?.courses || [];
  const recentEnrollments = data?.recentEnrollments || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Instructor Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Track your courses and earnings</p>
        </div>
        <Link to="/instructor/courses/create" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: 'Total Courses', value: stats.totalCourses || 0, sub: `${stats.publishedCourses || 0} published`, color: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600' },
          { icon: Users, label: 'Total Students', value: (stats.totalStudents || 0).toLocaleString(), sub: 'all courses', color: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600' },
          { icon: DollarSign, label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, sub: '70% share', color: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-600' },
          { icon: TrendingUp, label: 'Avg. Rating', value: courses.length > 0 ? (courses.reduce((s, c) => s + (c.ratings?.average || 0), 0) / courses.length).toFixed(1) : '—', sub: 'across all courses', color: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600' },
        ].map(({ icon: Icon, label, value, sub, color, iconColor }) => (
          <div key={label} className="card p-5">
            <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={iconColor} />
            </div>
            <p className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100">{value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card p-6">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-5">Monthly Revenue</h2>
          {monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Enrollment Trend */}
        <div className="card p-6">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-5">Enrollment Trend</h2>
          {monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="enrollments" stroke="#d946ef" strokeWidth={2} dot={{ fill: '#d946ef', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No enrollment data yet</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 dark:text-slate-100">My Courses</h2>
            <Link to="/instructor/courses" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              All courses <ArrowRight size={13} />
            </Link>
          </div>
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm mb-4">No courses yet</p>
              <Link to="/instructor/courses/create" className="btn-primary text-sm py-2">Create First Course</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.slice(0, 4).map(course => (
                <div key={course._id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
                  <img src={course.thumbnail?.url || 'https://via.placeholder.com/56x36'} alt="" className="w-14 h-9 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{course.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-400">{course.enrollmentCount} students</span>
                      <span className={`text-xs font-semibold ${course.status === 'published' ? 'text-green-600' : course.status === 'pending' ? 'text-amber-600' : 'text-slate-400'}`}>
                        {course.status}
                      </span>
                    </div>
                  </div>
                  <Link to={`/instructor/courses/${course._id}/edit`} className="text-xs text-primary-600 hover:underline flex-shrink-0">Edit</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Enrollments */}
        <div className="card p-5">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Recent Enrollments</h2>
          {recentEnrollments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No enrollments yet</div>
          ) : (
            <div className="space-y-3">
              {recentEnrollments.slice(0, 5).map((enr, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img
                    src={enr.user?.avatar?.url || `https://ui-avatars.com/api/?name=${enr.user?.name}&background=0ea5e9&color=fff&size=36`}
                    alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{enr.user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{enr.courses?.[0]?.course?.title}</p>
                  </div>
                  <p className="text-xs text-slate-400 flex-shrink-0">₹{enr.totalAmount}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
