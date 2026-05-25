import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, BookOpen, DollarSign, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#0ea5e9', '#d946ef', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="skeleton h-72 rounded-2xl" />
        <div className="skeleton h-72 rounded-2xl" />
      </div>
    </div>
  );

  const stats = data?.stats || {};
  const monthlyRevenue = (data?.monthlyRevenue || []).map(m => ({
    name: MONTH_NAMES[m._id.month - 1],
    revenue: m.revenue,
    orders: m.orders,
  }));

  const categoryData = (data?.topCourses || []).slice(0, 5).map((c, i) => ({
    name: c.category || 'Other',
    value: c.enrollmentCount || 0,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Platform overview and management</p>
        </div>
        {stats.pendingCourses > 0 && (
          <Link to="/admin/pending" className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-amber-100 transition-colors">
            <AlertCircle size={16} /> {stats.pendingCourses} Pending Review
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: Users, label: 'Total Users', value: (stats.totalUsers || 0).toLocaleString(), color: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600' },
          { icon: BookOpen, label: 'Total Courses', value: (stats.totalCourses || 0).toLocaleString(), color: 'bg-violet-50 dark:bg-violet-900/20', iconColor: 'text-violet-600' },
          { icon: DollarSign, label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, color: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600' },
          { icon: TrendingUp, label: 'Total Orders', value: (stats.totalOrders || 0).toLocaleString(), color: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-600' },
          { icon: Clock, label: 'Pending Courses', value: stats.pendingCourses || 0, color: 'bg-red-50 dark:bg-red-900/20', iconColor: 'text-red-600' },
        ].map(({ icon: Icon, label, value, color, iconColor }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={iconColor} />
            </div>
            <p className="text-xl font-bold font-display text-slate-800 dark:text-slate-100">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-5">Revenue Overview</h2>
          {monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="card p-6">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-5">Top Courses</h2>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                    {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {categoryData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-slate-600 dark:text-slate-400 truncate flex-1">{d.name}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No course data</div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-slate-800 dark:text-slate-100">Recent Orders</h2>
          <span className="text-xs text-slate-400">Last {data?.recentOrders?.length || 0} orders</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                {['Invoice', 'Student', 'Courses', 'Amount', 'Date', 'Status'].map(h => (
                  <th key={h} className="pb-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {(data?.recentOrders || []).map(order => (
                <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 pr-4 text-xs text-slate-500 font-mono">{order.invoiceNumber?.slice(-8)}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <img src={`https://ui-avatars.com/api/?name=${order.user?.name}&background=0ea5e9&color=fff&size=28`}
                        alt="" className="w-7 h-7 rounded-full" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{order.user?.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-slate-500">{order.courses?.length} course{order.courses?.length > 1 ? 's' : ''}</td>
                  <td className="py-3 pr-4 font-semibold text-slate-800 dark:text-slate-100">₹{order.totalAmount?.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-slate-500 text-xs">{new Date(order.paidAt || order.createdAt).toLocaleDateString()}</td>
                  <td className="py-3"><span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">✓ Paid</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {(data?.recentOrders?.length || 0) === 0 && (
            <p className="text-center text-slate-400 text-sm py-8">No orders yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
