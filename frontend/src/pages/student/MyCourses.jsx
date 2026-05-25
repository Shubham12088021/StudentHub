import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/api';
import { Play, CheckCircle } from 'lucide-react';

export default function MyCourses() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    userService.getDashboard()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-60 rounded-2xl" />)}
    </div>
  );

  const courses = data?.enrolledCourses || [];
  const progresses = data?.progresses || [];

  const getProgress = (courseId) =>
    progresses.find(p => p.course?._id === courseId || p.course === courseId);

  const filtered = tab === 'completed'
    ? courses.filter(c => getProgress(c._id)?.isCompleted)
    : tab === 'inprogress'
      ? courses.filter(c => { const p = getProgress(c._id); return p && !p.isCompleted && p.progressPercentage > 0; })
      : courses;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">My Courses</h1>
        <Link to="/courses" className="btn-primary text-sm py-2">+ Browse More</Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {[
          { key: 'all', label: `All (${courses.length})` },
          { key: 'inprogress', label: 'In Progress' },
          { key: 'completed', label: 'Completed' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No courses here</h3>
          <Link to="/courses" className="btn-primary mt-4 inline-block">Browse Courses</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(course => {
            const progress = getProgress(course._id);
            const pct = progress?.progressPercentage || 0;
            return (
              <div key={course._id} className="card overflow-hidden group hover:shadow-md transition-shadow">
                <div className="relative">
                  <img src={course.thumbnail?.url || 'https://via.placeholder.com/400x225'} alt={course.title}
                    className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link to={`/student/learn/${course._id}`}
                      className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <Play size={20} className="text-primary-600 ml-1" />
                    </Link>
                  </div>
                  {progress?.isCompleted && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle size={11} /> Completed
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 text-sm mb-3 group-hover:text-primary-600 transition-colors">
                    {course.title}
                  </h3>

                  <div className="progress-bar mb-1">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{pct}% complete</span>
                    <span>{progress?.completedLectures?.length || 0} lectures done</span>
                  </div>

                  <Link to={`/student/learn/${course._id}`}
                    className="btn-primary w-full mt-4 text-sm py-2 text-center block">
                    {pct > 0 ? 'Continue' : 'Start'} Learning
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
