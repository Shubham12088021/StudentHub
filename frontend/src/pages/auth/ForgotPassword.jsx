import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import api from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending reset email');
    } finally { setLoading(false); }
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Password</h1>
          <p className="text-slate-500 mt-1">We'll send a reset link to your email</p>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-6xl mb-4">📧</div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-2">Check your inbox!</h3>
              <p className="text-sm text-slate-500 mb-6">We've sent a password reset link to <strong>{email}</strong>. It expires in 15 minutes.</p>
              <Link to="/login" className="btn-primary">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Email Address</label>
                <input type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className="input-field" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <Link to="/login" className="block text-center text-sm text-slate-500 hover:text-primary-600 transition-colors">
                ← Back to login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
