import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import { Search, UserCheck, UserX, ShieldCheck } from 'lucide-react';

// ─── ADMIN USERS ─────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ search, role, limit: 50 });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch {} finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchUsers(); }, [search, role]);

  const toggleStatus = async (id) => {
    try {
      const res = await adminService.toggleUserStatus(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: res.data.user.isActive } : u));
      toast.success(res.data.message);
    } catch { toast.error('Failed to update user'); }
  };

  const approveInstructor = async (id) => {
    try {
      const res = await adminService.approveInstructor(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isApproved: res.data.user.isApproved } : u));
      toast.success(res.data.message);
    } catch { toast.error('Failed to update instructor'); }
  };

  const ROLE_BADGE = {
    admin: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    instructor: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
    student: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">{total.toLocaleString()} total users</p>
        </div>
      </div>

      <div className="card p-5 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input-field pl-9 text-sm" placeholder="Search by name or email..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-field text-sm w-full sm:w-44" value={role} onChange={e => setRole(e.target.value)}>
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar?.url || `https://ui-avatars.com/api/?name=${user.name}&background=0ea5e9&color=fff&size=36`}
                          alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`badge text-xs w-fit ${ROLE_BADGE[user.role]}`}>{user.role}</span>
                        {user.role === 'instructor' && (
                          <span className={`badge text-xs w-fit ${user.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {user.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge text-xs ${user.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleStatus(user._id)}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                          className={`p-1.5 rounded-lg transition-colors ${user.isActive ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'}`}>
                          {user.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                        {user.role === 'instructor' && (
                          <button onClick={() => approveInstructor(user._id)}
                            title={user.isApproved ? 'Revoke Approval' : 'Approve Instructor'}
                            className={`p-1.5 rounded-lg transition-colors ${user.isApproved ? 'text-amber-500 hover:bg-amber-50' : 'text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20'}`}>
                            <ShieldCheck size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p className="text-center text-slate-400 text-sm py-10">No users found</p>}
          </div>
        </div>
      )}
    </div>
  );
}
