import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme, useCart } from '../../context/AppContext';
import { GraduationCap, Search, ShoppingCart, Moon, Sun, Menu, X, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const dashboardLink = user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard';

  return (
    <header className="sticky top-0 z-40 glass border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-600 rounded-xl flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900 dark:text-white hidden sm:block">
              Student<span className="text-primary-600">Hub</span>
            </span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
            <div className="relative w-full">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search courses, topics, instructors..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-primary-300 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none transition-all"
              />
            </div>
          </form>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/courses" className="nav-link px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">
              Courses
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <Link to="/cart" className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
              <ShoppingCart size={19} />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold w-5 h-5">
                  {cart.length}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <img
                    src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.name}&background=0ea5e9&color=fff&size=32`}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <ChevronDown size={14} className="text-slate-500 hidden sm:block" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-12 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 py-2 animate-slide-up">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{user?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
                      </div>
                      <Link to={dashboardLink} onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                      <button
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4 hidden sm:block">Log in</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign up</Link>
              </div>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search courses..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm outline-none"
                />
              </div>
            </form>
            <Link to="/courses" className="block py-2 nav-link text-sm" onClick={() => setMobileOpen(false)}>Browse Courses</Link>
            {!isAuthenticated && (
              <>
                <Link to="/login" className="block py-2 nav-link text-sm" onClick={() => setMobileOpen(false)}>Log in</Link>
                <Link to="/register" className="block py-2 nav-link text-sm" onClick={() => setMobileOpen(false)}>Sign up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
