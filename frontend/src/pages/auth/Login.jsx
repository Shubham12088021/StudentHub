import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form);
    if (result.success) {
      if (result.role === 'admin') navigate('/admin/dashboard');
      else if (result.role === 'instructor') navigate('/instructor/dashboard');
      else navigate('/student/dashboard');
    }
  };

  const fillDemo = (email, password) => setForm({ email, password });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-accent-600 rounded-2xl flex items-center justify-center">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-slate-900 dark:text-white">StudentHub</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back!</h1>
          <p className="text-slate-500 mt-1">Sign in to continue learning</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</span>
                : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Quick Demo Login:</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Admin', email: 'admin@studenthub.com', pass: 'Admin@123' },
                { label: 'Instructor', email: 'priya@studenthub.com', pass: 'Instructor@123' },
                { label: 'Student', email: 'arjun@studenthub.com', pass: 'Student@123' },
              ].map(d => (
                <button key={d.label} onClick={() => fillDemo(d.email, d.pass)}
                  className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 py-1.5 rounded-lg hover:bg-primary-100 transition-colors font-medium">
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 text-center text-sm text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">Sign up free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
