import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, courseService } from '../../services/api';
import { StarRating } from '../../components/common/CourseCard';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Eye, Search, Users, BookOpen } from 'lucide-react';

// ─── ALL COURSES ──────────────────────────────────────────────────────────────
export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    courseService.getAll({ limit: 100, search, status: status || undefined })
      .then(res => setCourses(res.data.courses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, status]);

  const STATUS_COLORS = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-slate-100 text-slate-600',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">All Courses</h1>
        <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{courses.length} courses</span>
      </div>

      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input-field pl-9 text-sm" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field text-sm w-full sm:w-44" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="pending">Pending</option>
          <option value="draft">Draft</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {['Course', 'Instructor', 'Category', 'Students', 'Price', 'Rating', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {courses.map(course => (
                  <tr key={course._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={course.thumbnail?.url || 'https://via.placeholder.com/48x30'} alt=""
                          className="w-12 h-8 object-cover rounded flex-shrink-0" />
                        <p className="font-medium text-slate-700 dark:text-slate-300 line-clamp-1 max-w-[200px]">{course.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{course.instructor?.name}</td>
                    <td className="px-4 py-3"><span className="badge bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs">{course.category}</span></td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Users size={12} />{course.enrollmentCount?.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">₹{(course.discountPrice || course.price)?.toLocaleString()}</td>
                    <td className="px-4 py-3"><StarRating rating={course.ratings?.average} /></td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${STATUS_COLORS[course.status] || STATUS_COLORS.draft}`}>{course.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/courses/${course._id}`} target="_blank" className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors inline-block">
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {courses.length === 0 && <p className="text-center text-slate-400 text-sm py-10">No courses found</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PENDING COURSES ──────────────────────────────────────────────────────────
export function AdminPending() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    adminService.getPendingCourses()
      .then(res => setCourses(res.data.courses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id, status) => {
    setProcessing(id);
    try {
      await adminService.approveCourse(id, { status, reason: status === 'rejected' ? 'Does not meet content guidelines' : '' });
      setCourses(prev => prev.filter(c => c._id !== id));
      toast.success(`Course ${status}!`);
    } catch { toast.error('Action failed'); }
    finally { setProcessing(null); }
  };

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Pending Approval</h1>
          <p className="text-slate-500 text-sm mt-1">{courses.length} courses awaiting review</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle size={56} className="mx-auto text-green-400 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">All caught up!</h3>
          <p className="text-slate-500">No courses pending approval.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {courses.map(course => (
            <div key={course._id} className="card p-5">
              <div className="flex flex-col sm:flex-row gap-5">
                <img src={course.thumbnail?.url || 'https://via.placeholder.com/180x110'} alt={course.title}
                  className="w-full sm:w-44 h-28 object-cover rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{course.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <img src={course.instructor?.avatar?.url || `https://ui-avatars.com/api/?name=${course.instructor?.name}&background=0ea5e9&color=fff&size=24`}
                          alt="" className="w-6 h-6 rounded-full" />
                        <span className="text-sm text-slate-500">{course.instructor?.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(course._id, 'approved')}
                        disabled={processing === course._id}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
                      >
                        <CheckCircle size={15} /> Approve
                      </button>
                      <button
                        onClick={() => handleApprove(course._id, 'rejected')}
                        disabled={processing === course._id}
                        className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
                      >
                        <XCircle size={15} /> Reject
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-3">{course.description}</p>

                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                    <span className="badge bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300">{course.category}</span>
                    <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{course.level}</span>
                    <span className="flex items-center gap-1"><BookOpen size={11} /> {course.totalLectures || 0} lectures</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">₹{(course.discountPrice || course.price)?.toLocaleString()}</span>
                    <span className="text-slate-400">Submitted {new Date(course.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
