import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../../services/api';
import { Plus, Edit, Trash2, Eye, EyeOff, Users, Star, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  published: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  draft: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
  pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

export default function InstructorCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseService.getMyCourses()
      .then(res => setCourses(res.data.courses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    try {
      await courseService.delete(id);
      setCourses(prev => prev.filter(c => c._id !== id));
      toast.success('Course deleted');
    } catch { toast.error('Failed to delete course'); }
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await courseService.togglePublish(id);
      setCourses(prev => prev.map(c => c._id === id ? { ...c, status: res.data.course.status } : c));
      toast.success(res.data.message);
    } catch { toast.error('Failed to update status'); }
  };

  if (loading) return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">My Courses</h1>
          <p className="text-slate-500 text-sm mt-1">{courses.length} total courses</p>
        </div>
        <Link to="/instructor/courses/create" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Create Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={56} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No courses yet</h3>
          <p className="text-slate-500 mb-6">Create your first course and start teaching!</p>
          <Link to="/instructor/courses/create" className="btn-primary">Create Your First Course</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map(course => (
            <div key={course._id} className="card p-5 flex flex-col sm:flex-row gap-4">
              <img
                src={course.thumbnail?.url || 'https://via.placeholder.com/160x100'}
                alt={course.title}
                className="w-full sm:w-40 h-24 object-cover rounded-xl flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{course.title}</h3>
                    <span className={`badge mt-1 text-xs ${STATUS_COLORS[course.status] || STATUS_COLORS.draft}`}>
                      {course.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link to={`/instructor/courses/${course._id}/edit`}
                      className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => handleTogglePublish(course._id)}
                      className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                      title={course.status === 'published' ? 'Unpublish' : 'Submit for Review'}
                    >
                      {course.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button onClick={() => handleDelete(course._id)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Users size={14} /> {course.enrollmentCount?.toLocaleString() || 0} students
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star size={14} className="text-amber-400" />
                    {course.ratings?.average?.toFixed(1) || '—'} ({course.ratings?.count || 0})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={14} /> {course.totalLectures || 0} lectures
                  </span>
                  <span className="font-semibold text-primary-600">
                    ₹{(course.discountPrice || course.price)?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
