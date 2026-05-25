import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [showPass, setShowPass] = useState(false);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { alert('Password must be at least 6 characters'); return; }
    const result = await register(form);
    if (result.success) {
      if (result.role === 'instructor') navigate('/instructor/dashboard');
      else navigate('/student/dashboard');
    }
  };

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
          <p className="text-slate-500 mt-1">Join 500,000+ learners worldwide</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Full Name</label>
              <input type="text" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe" className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Email Address</label>
              <input type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com" className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 characters" className="input-field pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'student', label: '🎓 Learn', desc: 'Take courses & get certified' },
                  { value: 'instructor', label: '🧑‍🏫 Teach', desc: 'Create & sell courses' },
                ].map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => setForm({ ...form, role: opt.value })}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${form.role === opt.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'}`}>
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{opt.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account...</span>
                : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
