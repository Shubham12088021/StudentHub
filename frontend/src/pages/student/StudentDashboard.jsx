import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Award, Clock, TrendingUp, Play, ArrowRight, CheckCircle } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getDashboard()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="skeleton h-28 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  const stats = data?.stats || {};
  const progresses = data?.progresses || [];
  const enrolledCourses = data?.enrolledCourses || [];

  const inProgressCourses = progresses.filter(p => !p.isCompleted && p.progressPercentage > 0);
  const completedCourses = progresses.filter(p => p.isCompleted);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white p-6 md:p-8">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -right-4 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative">
          <p className="text-primary-200 text-sm font-medium mb-1">Good {getTimeOfDay()},</p>
          <h1 className="text-2xl md:text-3xl font-bold font-display mb-3">
            {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-primary-100 text-sm max-w-md">
            {stats.inProgressCourses > 0
              ? `You have ${stats.inProgressCourses} course${stats.inProgressCourses > 1 ? 's' : ''} in progress. Keep it up!`
              : 'Start learning today and unlock your potential!'}
          </p>
          <Link to="/courses" className="inline-flex items-center gap-2 mt-4 bg-white text-primary-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors">
            Browse Courses <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: 'Enrolled', value: stats.enrolledCourses || 0, color: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600' },
          { icon: Play, label: 'In Progress', value: stats.inProgressCourses || 0, color: 'bg-orange-50 dark:bg-orange-900/20', iconColor: 'text-orange-600' },
          { icon: CheckCircle, label: 'Completed', value: stats.completedCourses || 0, color: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600' },
          { icon: Clock, label: 'Hours Learned', value: `${Math.round((stats.totalHoursLearned || 0) / 60)}h`, color: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600' },
        ].map(({ icon: Icon, label, value, color, iconColor }) => (
          <div key={label} className="card p-5">
            <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={iconColor} />
            </div>
            <p className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100">{value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Continue Learning</h2>
            <Link to="/student/my-courses" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {inProgressCourses.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="text-5xl mb-3">📚</div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No courses in progress</p>
              <p className="text-sm text-slate-500 mb-4">Enroll in a course to start learning</p>
              <Link to="/courses" className="btn-primary text-sm">Browse Courses</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {inProgressCourses.slice(0, 3).map(progress => (
                <div key={progress._id} className="card p-4 flex gap-4 hover:shadow-md transition-shadow group">
                  <img
                    src={progress.course?.thumbnail?.url || 'https://via.placeholder.com/80x50'}
                    alt={progress.course?.title}
                    className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {progress.course?.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 progress-bar">
                        <div className="progress-fill" style={{ width: `${progress.progressPercentage}%` }} />
                      </div>
                      <span className="text-xs text-slate-500 font-medium flex-shrink-0">{progress.progressPercentage}%</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {progress.completedLectures?.length} / {progress.course?.totalLectures} lectures
                    </p>
                  </div>
                  <Link
                    to={`/student/learn/${progress.course?._id}`}
                    className="flex-shrink-0 w-9 h-9 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center transition-colors self-center"
                  >
                    <Play size={14} className="text-white ml-0.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Achievements */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Achievements</h2>
          <div className="card p-5 space-y-4">
            {completedCourses.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-sm text-slate-500">Complete courses to earn certificates!</p>
              </div>
            ) : (
              completedCourses.slice(0, 3).map(p => (
                <div key={p._id} className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award size={18} className="text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">{p.course?.title}</p>
                    <p className="text-xs text-amber-600">Certificate Earned</p>
                  </div>
                </div>
              ))
            )}
            <div className="pt-2">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <TrendingUp size={16} className="text-primary-500" />
                <span>{enrolledCourses.length} total enrollments</span>
              </div>
            </div>
          </div>

          {/* Enrolled courses quick list */}
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-6 mb-4">My Courses</h2>
          <div className="card divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
            {enrolledCourses.length === 0 ? (
              <div className="p-5 text-center text-sm text-slate-500">No courses yet</div>
            ) : (
              enrolledCourses.slice(0, 4).map(course => (
                <Link
                  key={course._id}
                  to={`/student/learn/${course._id}`}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <img
                    src={course.thumbnail?.url || 'https://via.placeholder.com/40x28'}
                    alt={course.title}
                    className="w-12 h-8 object-cover rounded"
                  />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-1 flex-1">{course.title}</p>
                  <Play size={13} className="text-primary-500 flex-shrink-0" />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
