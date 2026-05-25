import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { courseService } from '../services/api';
import CourseCard from '../components/common/CourseCard';
import { ArrowRight, BookOpen, Users, Award, Zap, Globe } from 'lucide-react';

const CATEGORIES = [
  { name: 'Web Development', icon: '💻', count: '1,200+' },
  { name: 'Data Science', icon: '📊', count: '850+' },
  { name: 'UI/UX Design', icon: '🎨', count: '640+' },
  { name: 'Mobile Development', icon: '📱', count: '520+' },
  { name: 'DevOps', icon: '⚙️', count: '380+' },
  { name: 'Digital Marketing', icon: '📈', count: '760+' },
  { name: 'Business', icon: '💼', count: '920+' },
  { name: 'Machine Learning', icon: '🤖', count: '430+' },
];

const STATS = [
  { icon: Users, value: '500K+', label: 'Active Students' },
  { icon: BookOpen, value: '12,000+', label: 'Online Courses' },
  { icon: Award, value: '3,500+', label: 'Expert Instructors' },
  { icon: Globe, value: '150+', label: 'Countries' },
];

export default function Home() {
  const [featured, setFeatured] = useState({ featured: [], popular: [], newest: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    courseService.getFeatured()
      .then(res => setFeatured(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-sm mb-6">
              <Zap size={14} className="text-yellow-400" />
              <span>India's #1 Online Learning Platform</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight mb-6">
              Learn Without
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
                Limits
              </span>
            </h1>

            <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-2xl">
              Unlock your potential with 12,000+ expert-led courses. Learn new skills, advance your career, and earn recognized certificates — all at your own pace.
            </p>

            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mb-8">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="What do you want to learn today?"
                className="flex-1 px-5 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-400 transition-all"
              />
              <button type="submit" className="btn-primary px-6 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-400">
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-3 text-sm text-slate-400">
              <span>Popular:</span>
              {['React.js', 'Python', 'Figma', 'AWS', 'Machine Learning'].map(tag => (
                <button
                  key={tag}
                  onClick={() => navigate(`/courses?search=${tag}`)}
                  className="text-primary-400 hover:text-primary-300 hover:underline transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display text-slate-900 dark:text-white">{value}</p>
                  <p className="text-sm text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Browse by Category</h2>
            <Link to="/courses" className="text-primary-600 dark:text-primary-400 flex items-center gap-1 text-sm font-semibold hover:underline">
              All categories <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {CATEGORIES.map(({ name, icon, count }) => (
              <Link
                key={name}
                to={`/courses?category=${encodeURIComponent(name)}`}
                className="card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{name}</p>
                <p className="text-xs text-slate-500 mt-1">{count} courses</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featured.popular?.length > 0 && (
        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">Most Popular Courses</h2>
                <p className="text-slate-500 mt-1">Join thousands of learners</p>
              </div>
              <Link to="/courses?sort=-enrollmentCount" className="btn-secondary text-sm py-2">
                View All
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <CourseCardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featured.popular.slice(0, 8).map(course => <CourseCard key={course._id} course={course} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Newest Courses */}
      {featured.newest?.length > 0 && (
        <section className="py-16 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">Newest Courses</h2>
                <p className="text-slate-500 mt-1">Fresh content just added</p>
              </div>
              <Link to="/courses?sort=-createdAt" className="btn-secondary text-sm py-2">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featured.newest.slice(0, 4).map(course => <CourseCard key={course._id} course={course} />)}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Why Choose StudentHub?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">We provide the best learning experience with industry experts and real-world projects</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🎯', title: 'Expert Instructors', desc: 'Learn from industry professionals with years of real-world experience.' },
              { icon: '🏆', title: 'Certificates', desc: 'Earn recognized certificates upon course completion to boost your career.' },
              { icon: '📱', title: 'Learn Anywhere', desc: 'Access your courses on any device, at any time, at your own pace.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center p-8 card hover:shadow-md transition-shadow">
                <div className="text-5xl mb-5">{icon}</div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">{title}</h3>
                <p className="text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 hero-gradient text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-5">Start Learning Today</h2>
          <p className="text-white/80 mb-8 text-lg">Join 500,000+ students already learning on StudentHub</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register" className="bg-white text-primary-700 hover:bg-primary-50 font-bold px-8 py-3.5 rounded-xl transition-all">
              Get Started Free
            </Link>
            <Link to="/courses" className="border-2 border-white/50 hover:border-white text-white font-bold px-8 py-3.5 rounded-xl transition-all">
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function CourseCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-video w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-3 w-1/3" />
        <div className="flex justify-between pt-2">
          <div className="skeleton h-5 w-16" />
          <div className="skeleton h-7 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
