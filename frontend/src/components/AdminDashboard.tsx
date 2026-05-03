import React, { useState, useEffect } from 'react';
import { LogOut, Lock, Unlock, Trash2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api/adminAPI';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const token = localStorage.getItem('token');

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError(null);
        const data = await adminAPI.getStatistics();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch users
  useEffect(() => {
    if (activeTab === 'users') {
      const fetchUsers = async () => {
        try {
          setLoading(true);
          const data = await adminAPI.getAllUsers(page);
          setUsers(data.users || data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }
  }, [activeTab, page]);

  // Fetch reports
  useEffect(() => {
    if (activeTab === 'reports') {
      const fetchReports = async () => {
        try {
          setLoading(true);
          const data = await adminAPI.getReports(undefined, page);
          setReports(data.reports || data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchReports();
    }
  }, [activeTab, page]);

  // Fetch posts for moderation
  useEffect(() => {
    if (activeTab === 'moderation') {
      const fetchPosts = async () => {
        try {
          setLoading(true);
          const data = await adminAPI.getAllPosts(page);
          setPosts(data.posts || data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchPosts();
    }
  }, [activeTab, page]);

  // Action handlers
  const handleBlockUser = async (userId: number) => {
    if (!window.confirm('Block this user? They will not be able to login.')) return;
    try {
      await adminAPI.blockUser(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: false } : u));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUnblockUser = async (userId: number) => {
    try {
      await adminAPI.unblockUser(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: true } : u));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleApproveReport = async (reportId: number) => {
    if (!window.confirm('Approve this report? The post will be deleted.')) return;
    try {
      await adminAPI.approveReport(reportId);
      setReports(reports.filter(r => r.id !== reportId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRejectReport = async (reportId: number) => {
    try {
      await adminAPI.rejectReport(reportId);
      setReports(reports.filter(r => r.id !== reportId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await adminAPI.deletePost(postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  if (loading && activeTab === 'dashboard') {
    return <div className="min-h-screen flex items-center justify-center text-slate-600">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-[1400px] mx-auto px-4 pb-10">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500">System Management and Control</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* STATISTICS CARDS */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-blue-600 font-bold text-sm mb-2">TOTAL USERS</div>
              <div className="text-4xl font-bold text-blue-900">{stats.totalUsers}</div>
            </div>
            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="text-green-600 font-bold text-sm mb-2">TOTAL POSTS</div>
              <div className="text-4xl font-bold text-green-900">{stats.totalPosts}</div>
            </div>
            <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-purple-600 font-bold text-sm mb-2">TOTAL COMMENTS</div>
              <div className="text-4xl font-bold text-purple-900">{stats.totalComments}</div>
            </div>
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <div className="text-red-600 font-bold text-sm mb-2">PENDING REPORTS</div>
              <div className="text-4xl font-bold text-red-900">{stats.pendingReports}</div>
            </div>
          </div>
        )}

        {/* TABS */}
        <div className="flex gap-4 mb-6 border-b border-slate-200 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'users', label: 'Users', icon: '👥' },
            { id: 'reports', label: 'Reports', icon: '⚠️' },
            { id: 'moderation', label: 'Moderation', icon: '🛡️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`px-4 py-2 font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">System Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 rounded-lg">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-700">Active Users:</span>
                      <span className="font-bold">{stats?.totalUsers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Total Posts:</span>
                      <span className="font-bold">{stats?.totalPosts || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Total Comments:</span>
                      <span className="font-bold">{stats?.totalComments || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Pending Reports:</span>
                      <span className="font-bold text-red-600">{stats?.pendingReports || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-lg">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">System Health</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-slate-700">Database: Connected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-slate-700">API: Running</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-slate-700">Authentication: Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">User Management</h2>
              {loading ? (
                <p className="text-slate-600">Loading users...</p>
              ) : users.length === 0 ? (
                <p className="text-slate-600">No users found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 border-b">
                      <tr>
                        <th className="px-4 py-3 font-bold">Username</th>
                        <th className="px-4 py-3 font-bold">Email</th>
                        <th className="px-4 py-3 font-bold">Full Name</th>
                        <th className="px-4 py-3 font-bold">Status</th>
                        <th className="px-4 py-3 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">{user.userName}</td>
                          <td className="px-4 py-3">{user.email}</td>
                          <td className="px-4 py-3">{user.fullName || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {user.isActive ? 'Active' : 'Blocked'}
                            </span>
                          </td>
                          <td className="px-4 py-3 flex gap-2">
                            {user.isActive ? (
                              <button
                                onClick={() => handleBlockUser(user.id)}
                                className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                                title="Block user"
                              >
                                <Lock size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnblockUser(user.id)}
                                className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200 transition"
                                title="Unblock user"
                              >
                                <Unlock size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Report Management</h2>
              {loading ? (
                <p className="text-slate-600">Loading reports...</p>
              ) : reports.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-600 text-lg">✓ No pending reports - System is safe!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 border-b">
                      <tr>
                        <th className="px-4 py-3 font-bold">Post Author</th>
                        <th className="px-4 py-3 font-bold">Reason</th>
                        <th className="px-4 py-3 font-bold">Reported By</th>
                        <th className="px-4 py-3 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {reports.map(report => (
                        <tr key={report.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">{report.postAuthor || 'Unknown'}</td>
                          <td className="px-4 py-3">{report.reason || 'No reason'}</td>
                          <td className="px-4 py-3">{report.reportedBy || 'Anonymous'}</td>
                          <td className="px-4 py-3 flex gap-2">
                            <button
                              onClick={() => handleApproveReport(report.id)}
                              className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200 transition"
                              title="Approve and delete post"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleRejectReport(report.id)}
                              className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition"
                              title="Reject report"
                            >
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* MODERATION TAB */}
          {activeTab === 'moderation' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Content Moderation</h2>
              {loading ? (
                <p className="text-slate-600">Loading posts...</p>
              ) : posts.length === 0 ? (
                <p className="text-slate-600">No posts found</p>
              ) : (
                <div className="space-y-4">
                  {posts.map(post => (
                    <div key={post.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{post.author || 'Unknown'}</p>
                          <p className="text-slate-700 my-2">{post.content || post.text || 'No content'}</p>
                          <p className="text-xs text-slate-500">
                            {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Unknown date'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                          title="Delete post"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
