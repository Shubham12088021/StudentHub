import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseService, reviewService, paymentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/AppContext';
import { StarRating } from '../components/common/CourseCard';
import toast from 'react-hot-toast';
import {
  Play, Clock, Users, BarChart2, Globe, CheckCircle,
  ChevronDown, ChevronUp, ShoppingCart, Zap, Lock, FileText,
} from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToCart, isInCart } = useCart();

  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState([0]);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, reviewRes] = await Promise.all([
          courseService.getOne(id),
          reviewService.get(id, { limit: 5 }),
        ]);
        setCourse(courseRes.data.course);
        setReviews(reviewRes.data.reviews || []);
        if (user && courseRes.data.course.enrolledStudents?.some(s => s === user._id || s._id === user._id)) {
          setIsEnrolled(true);
        }
      } catch {
        toast.error('Course not found');
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const handleAddToCart = () => {
    const added = addToCart(course);
    if (added) toast.success('Added to cart!');
    else toast('Already in cart', { icon: '🛒' });
  };

  const handleEnrollFree = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setEnrolling(true);
    try {
      await paymentService.enrollFree(course._id);
      toast.success('Enrolled successfully! 🎉');
      setIsEnrolled(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally { setEnrolling(false); }
  };

  const toggleSection = (i) =>
    setExpandedSections(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton aspect-video w-full rounded-2xl" />
        </div>
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    </div>
  );

  if (!course) return null;

  const price = course.discountPrice || course.price;
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;
  const discountPct = hasDiscount ? Math.round(((course.price - course.discountPrice) / course.price) * 100) : 0;
    return (
    <div className="bg-white dark:bg-slate-900 min-h-screen">
      {/* Hero */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl">
            <div className="flex gap-2 mb-4">
              <span className="badge bg-primary-600/30 text-primary-300 border border-primary-500/30">{course.category}</span>
              <span className="badge bg-white/10 text-slate-300">{course.level}</span>
              {course.isBestseller && <span className="badge bg-amber-400 text-amber-900">⭐ Bestseller</span>}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-display leading-tight mb-4">{course.title}</h1>
            <p className="text-slate-300 text-lg mb-6 leading-relaxed">{course.shortDescription || course.description?.slice(0, 200)}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
              <StarRating rating={course.ratings?.average} count={course.ratings?.count} size="md" />
              <span className="flex items-center gap-1.5 text-slate-300">
                <Users size={15} /> {course.enrollmentCount?.toLocaleString()} students
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Clock size={15} /> {course.totalLectures} lectures
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Globe size={15} /> {course.language}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={course.instructor?.avatar?.url || `https://ui-avatars.com/api/?name=${course.instructor?.name}&background=0ea5e9&color=fff`}
                alt={course.instructor?.name}
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <span className="text-slate-400 text-sm">Created by </span>
                <span className="text-primary-400 font-semibold text-sm">{course.instructor?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left - Course Content */}
          <div className="flex-1 min-w-0 order-2 lg:order-1">

            {/* What you'll learn */}
            {course.whatYouLearn?.length > 0 && (
              <div className="card p-6 mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">What You'll Learn</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.whatYouLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Curriculum */}
            <div className="card p-6 mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Course Curriculum</h2>
              <p className="text-sm text-slate-500 mb-5">
                {course.sections?.length} sections • {course.totalLectures} lectures • {course.totalDuration} min total
              </p>

              {course.sections?.map((section, sIdx) => (
                <div key={sIdx} className="border border-slate-200 dark:border-slate-700 rounded-xl mb-3 overflow-hidden">
                  <button
                    onClick={() => toggleSection(sIdx)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors text-left"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{section.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{section.lectures?.length || 0} lectures</p>
                    </div>
                    {expandedSections.includes(sIdx) ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </button>

                  {expandedSections.includes(sIdx) && section.lectures?.length > 0 && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {section.lectures.map((lec, lIdx) => (
                        <div key={lIdx} className="flex items-center gap-3 px-4 py-3">
                          {lec.isFree ? (
                            <Play size={15} className="text-primary-500 flex-shrink-0" />
                          ) : (
                            <Lock size={15} className="text-slate-400 flex-shrink-0" />
                          )}
                          <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{lec.title}</span>
                          <div className="flex items-center gap-2">
                            {lec.type === 'pdf' && <FileText size={13} className="text-slate-400" />}
                            {lec.isFree && !isEnrolled && (
                              <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold">Preview</span>
                            )}
                            {lec.duration > 0 && (
                              <span className="text-xs text-slate-400">{lec.duration}m</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Requirements */}
            {course.requirements?.length > 0 && (
              <div className="card p-6 mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <span className="text-slate-400 flex-shrink-0 mt-0.5">•</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructor */}
            <div className="card p-6 mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-5">Your Instructor</h2>
              <div className="flex items-start gap-4">
                <img
                  src={course.instructor?.avatar?.url || `https://ui-avatars.com/api/?name=${course.instructor?.name}&background=0ea5e9&color=fff&size=80`}
                  alt={course.instructor?.name}
                  className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                />
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{course.instructor?.name}</h3>
                  <p className="text-primary-600 dark:text-primary-400 text-sm mb-3">{course.instructor?.headline}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{course.instructor?.bio}</p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-5">Student Reviews</h2>
              <div className="flex items-center gap-8 mb-6">
                <div className="text-center">
                  <p className="text-6xl font-bold text-amber-500">{course.ratings?.average?.toFixed(1)}</p>
                  <StarRating rating={course.ratings?.average} size="md" />
                  <p className="text-sm text-slate-500 mt-1">{course.ratings?.count?.toLocaleString()} ratings</p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-4">{star}</span>
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: star === Math.round(course.ratings?.average) ? '60%' : `${Math.max(5, (star / 5) * 40)}%` }}
                        />
                      </div>
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                    </div>
                  ))}
                </div>
              </div>

              {reviews.length === 0 ? (
                <p className="text-slate-500 text-sm">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-5">
                  {reviews.map(review => (
                    <div key={review._id} className="flex gap-4 pb-5 border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <img
                        src={review.user?.avatar?.url || `https://ui-avatars.com/api/?name=${review.user?.name}&background=0ea5e9&color=fff&size=40`}
                        alt={review.user?.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">{review.user?.name}</span>
                          <StarRating rating={review.rating} />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right - Purchase Card (sticky) */}
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 order-1 lg:order-2">
            <div className="card overflow-hidden sticky top-24">
              {/* Preview thumbnail */}
              <div className="relative aspect-video bg-slate-900">
                <img
                  src={course.thumbnail?.url || 'https://via.placeholder.com/400x225?text=Course+Preview'}
                  alt={course.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <Play size={22} className="text-primary-600 ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-center text-white text-xs bg-black/50 rounded-lg py-1">
                  Preview this course
                </div>
              </div>

              <div className="p-5">
                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                      {price === 0 ? 'FREE' : `₹${price?.toLocaleString()}`}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-lg text-slate-400 line-through">₹{course.price?.toLocaleString()}</span>
                        <span className="badge bg-red-100 text-red-600">{discountPct}% OFF</span>
                      </>
                    )}
                  </div>
                  {hasDiscount && (
                    <p className="text-xs text-red-500 mt-1 font-semibold">⏰ Limited time offer!</p>
                  )}
                </div>

                {/* CTA buttons */}
                {isEnrolled ? (
                  <Link
                    to={`/student/learn/${course._id}`}
                    className="btn-primary w-full text-center block mb-3"
                  >
                    Continue Learning
                  </Link>
                ) : price === 0 ? (
                  <button
                    onClick={handleEnrollFree}
                    disabled={enrolling}
                    className="btn-primary w-full mb-3 disabled:opacity-60"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll for Free'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        if (!isAuthenticated) { navigate('/login'); return; }
                        addToCart(course);
                        navigate('/cart');
                      }}
                      className="btn-primary w-full mb-3 flex items-center justify-center gap-2"
                    >
                      <Zap size={16} /> Buy Now
                    </button>
                    <button
                      onClick={handleAddToCart}
                      className="btn-secondary w-full mb-3 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={16} />
                      {isInCart(course._id) ? 'Already in Cart' : 'Add to Cart'}
                    </button>
                  </>
                )}

                <p className="text-xs text-center text-slate-400 mb-4">30-Day Money-Back Guarantee</p>

                {/* Course includes */}
                <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-3">This course includes:</p>
                  <div className="space-y-2.5">
                    {[
                      { icon: Play, text: `${course.totalLectures} on-demand video lectures` },
                      { icon: FileText, text: 'Downloadable resources & PDFs' },
                      { icon: Globe, text: 'Full lifetime access' },
                      { icon: BarChart2, text: 'Certificate of completion' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                        <Icon size={15} className="text-slate-400 flex-shrink-0" />
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Star({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
}
