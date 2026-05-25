import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { courseService } from '../services/api';
import CourseCard from '../components/common/CourseCard';
import { X, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES, LEVELS } from '../utils/helpers';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest' },
  { value: '-enrollmentCount', label: 'Most Popular' },
  { value: '-ratings.average', label: 'Highest Rated' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
];

export default function CoursesPage() {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    level: '',
    sort: '-createdAt',
    minPrice: '',
    maxPrice: '',
    rating: '',
  });

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '')) };
      const res = await courseService.getAll(params);
      setCourses(res.data.courses);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {}
    setLoading(false);
  }, [filters, page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', level: '', sort: '-createdAt', minPrice: '', maxPrice: '', rating: '' });
    setPage(1);
  };

  const activeFiltersCount = Object.entries(filters).filter(([k, v]) => v && k !== 'sort').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">
            {filters.search ? `Results for "${filters.search}"` : filters.category || 'All Courses'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{total.toLocaleString()} courses found</p>
        </div>
        <div className="flex gap-3">
          {/* Sort */}
          <select
            value={filters.sort}
            onChange={e => updateFilter('sort', e.target.value)}
            className="input-field py-2 w-auto text-sm"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 btn-secondary text-sm py-2 lg:hidden"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFiltersCount > 0 && <span className="badge bg-primary-600 text-white w-5 h-5 text-xs p-0 flex items-center justify-center">{activeFiltersCount}</span>}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters - desktop always visible, mobile conditional */}
        <aside className={`w-72 flex-shrink-0 space-y-5 ${filtersOpen ? 'block' : 'hidden lg:block'} lg:block`}>
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Filters</h3>
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                  <X size={12} /> Clear all
                </button>
              )}
            </div>

            {/* Search */}
            <div className="mb-5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
                placeholder="Course title, topic..."
                className="input-field text-sm"
              />
            </div>

            {/* Category */}
            <div className="mb-5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Category</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="category" value="" checked={!filters.category} onChange={() => updateFilter('category', '')} className="accent-primary-600" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">All Categories</span>
                </label>
                {CATEGORIES.map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="category" value={cat} checked={filters.category === cat} onChange={() => updateFilter('category', cat)} className="accent-primary-600" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Level */}
            <div className="mb-5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Level</label>
              <div className="space-y-1.5">
                {['', ...LEVELS].map(lvl => (
                  <label key={lvl || 'all'} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="level" value={lvl} checked={filters.level === lvl} onChange={() => updateFilter('level', lvl)} className="accent-primary-600" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{lvl || 'All Levels'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div className="mb-5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Price Range (₹)</label>
              <div className="flex gap-2">
                <input type="number" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} placeholder="Min" className="input-field text-sm py-2 w-1/2" />
                <input type="number" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} placeholder="Max" className="input-field text-sm py-2 w-1/2" />
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Minimum Rating</label>
              <div className="space-y-1.5">
                {['', '4.5', '4', '3.5', '3'].map(r => (
                  <label key={r || 'any'} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="rating" value={r} checked={filters.rating === r} onChange={() => updateFilter('rating', r)} className="accent-primary-600" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{r ? `${r}+ ⭐` : 'Any Rating'}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Courses Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="card overflow-hidden">
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
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No courses found</h3>
              <p className="text-slate-500 mb-5">Try adjusting your search or filter criteria</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {courses.map(course => <CourseCard key={course._id} course={course} />)}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-2 px-4 disabled:opacity-50">Previous</button>
                  {[...Array(Math.min(5, pages))].map((_, i) => {
                    const p = page <= 3 ? i + 1 : page - 2 + i;
                    if (p > pages) return null;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${p === page ? 'bg-primary-600 text-white' : 'btn-secondary py-0 px-0'}`}>
                        {p}
                      </button>
                    );
                  })}
                  <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary text-sm py-2 px-4 disabled:opacity-50">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
