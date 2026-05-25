import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paymentService, wishlistService, userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CourseCard from '../../components/common/CourseCard';
import toast from 'react-hot-toast';
import { ShoppingBag, Heart, Camera } from 'lucide-react';

// ─── ORDERS ──────────────────────────────────────────────────────────────────
export function StudentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService.getOrders()
      .then(res => setOrders(res.data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>;

  return (
    <div>
      <h1 className="section-title mb-6">Order History</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No orders yet</h3>
          <Link to="/courses" className="btn-primary mt-4 inline-block">Browse Courses</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="card p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Invoice #{order.invoiceNumber}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{new Date(order.paidAt || order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">₹{order.totalAmount?.toLocaleString()}</p>
                  <span className="badge bg-green-50 dark:bg-green-900/20 text-green-600 text-xs">✓ Paid</span>
                </div>
              </div>
              <div className="space-y-3">
                {order.courses?.map((item, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <img src={item.course?.thumbnail?.url || 'https://via.placeholder.com/60x38'} alt="" className="w-14 h-9 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{item.course?.title}</p>
                      <p className="text-xs text-slate-400">₹{item.price?.toLocaleString()}</p>
                    </div>
                    <Link to={`/student/learn/${item.course?._id}`} className="text-xs text-primary-600 hover:underline flex-shrink-0">
                      Go to Course
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── WISHLIST ─────────────────────────────────────────────────────────────────
export function StudentWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wishlistService.get()
      .then(res => setWishlist(res.data.wishlist?.courses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const remove = async (courseId) => {
    try {
      await wishlistService.toggle(courseId);
      setWishlist(prev => prev.filter(w => w.course?._id !== courseId));
      toast.success('Removed from wishlist');
    } catch { toast.error('Failed to remove'); }
  };

  if (loading) return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}</div>;

  return (
    <div>
      <h1 className="section-title mb-6">My Wishlist</h1>
      {wishlist.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Your wishlist is empty</h3>
          <p className="text-slate-500 mb-5">Save courses you want to take later</p>
          <Link to="/courses" className="btn-primary inline-block">Browse Courses</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishlist.map(item => item.course && (
            <div key={item.course._id} className="relative">
              <CourseCard course={item.course} />
              <button onClick={() => remove(item.course._id)}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10">
                <Heart size={14} className="fill-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
export function StudentProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', headline: user?.headline || '', website: user?.website || '' });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar?.url);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
    if (avatar) fd.append('avatar', avatar);
    try {
      const res = await userService.updateProfile(fd);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="section-title mb-6">My Profile</h1>
      <div className="max-w-xl">
        <div className="card p-6">
          {/* Avatar */}
          <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
            <div className="relative">
              <img src={preview || `https://ui-avatars.com/api/?name=${user?.name}&background=0ea5e9&color=fff&size=80`}
                alt="" className="w-20 h-20 rounded-2xl object-cover" />
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                <Camera size={13} />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-100">{user?.name}</p>
              <p className="text-sm text-slate-500 capitalize">{user?.role}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Full Name</label>
              <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Headline</label>
              <input className="input-field" value={form.headline} onChange={e => setForm({ ...form, headline: e.target.value })} placeholder="e.g. Web Developer | Learner" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Bio</label>
              <textarea className="input-field h-24 resize-none" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Website</label>
              <input className="input-field" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://yourwebsite.com" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StudentOrders;
