import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/AppContext';
import {
  LayoutDashboard, BookOpen, ShoppingBag, Heart, User,
  PlusCircle, Users, LogOut, Moon, Sun,
  ChevronLeft, Menu, GraduationCap, ClipboardList,
} from 'lucide-react';
import NotificationDropdown from '../components/common/NotificationDropdown';

const navItems = {
  student: [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/my-courses', icon: BookOpen, label: 'My Courses' },
    { to: '/student/wishlist', icon: Heart, label: 'Wishlist' },
    { to: '/student/orders', icon: ShoppingBag, label: 'Orders' },
    { to: '/student/profile', icon: User, label: 'Profile' },
  ],
  instructor: [
    { to: '/instructor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/instructor/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/instructor/courses/create', icon: PlusCircle, label: 'Create Course' },
    { to: '/instructor/profile', icon: User, label: 'Profile' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/courses', icon: BookOpen, label: 'All Courses' },
    { to: '/admin/pending', icon: ClipboardList, label: 'Pending Approval' },
  ],
};

const roleColors = {
  student: 'from-primary-600 to-primary-800',
  instructor: 'from-violet-600 to-violet-800',
  admin: 'from-rose-600 to-rose-800',
};

const roleLabels = {
  student: 'Student Portal',
  instructor: 'Instructor Portal',
  admin: 'Admin Panel',
};

export default function DashboardLayout({ role }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const items = navItems[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`
        ${mobile ? 'fixed inset-0 z-50 flex' : 'relative hidden md:flex'}
        flex-col h-full
      `}
    >
      {mobile && (
        <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}
      <div
        className={`
          ${mobile ? 'relative w-72' : collapsed ? 'w-20' : 'w-64'}
          flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          transition-all duration-300 shadow-sm
        `}
      >
        {/* Brand */}
        <div className={`p-5 bg-gradient-to-br ${roleColors[role]}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <GraduationCap size={20} className="text-white" />
            </div>
            {(!collapsed || mobile) && (
              <div>
                <p className="font-bold font-display text-white text-sm leading-none">StudentHub</p>
                <p className="text-white/70 text-xs mt-0.5">{roleLabels[role]}</p>
              </div>
            )}
          </div>
        </div>

        {/* User info */}
        {(!collapsed || mobile) && (
          <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.name}&background=0ea5e9&color=fff`}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to.endsWith('dashboard')}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''} ${collapsed && !mobile ? 'justify-center px-2' : ''}`
              }
              onClick={() => mobile && setMobileOpen(false)}
              title={collapsed && !mobile ? label : undefined}
            >
              <Icon size={19} className="flex-shrink-0" />
              {(!collapsed || mobile) && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <button
            onClick={toggleTheme}
            className={`sidebar-link w-full ${collapsed && !mobile ? 'justify-center px-2' : ''}`}
          >
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
            {(!collapsed || mobile) && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 ${collapsed && !mobile ? 'justify-center px-2' : ''}`}
          >
            <LogOut size={19} />
            {(!collapsed || mobile) && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle (desktop only) */}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3.5 top-20 w-7 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors z-10"
          >
            <ChevronLeft
              size={14}
              className={`text-slate-500 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      {mobileOpen && <Sidebar mobile />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <button
              onClick={() => navigate('/')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium hidden sm:block"
            >
              ← Back to Site
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
