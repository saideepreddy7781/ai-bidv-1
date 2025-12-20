// Enhanced Admin Dashboard with User Management & System Oversight
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllUsers, getAllTenders, updateUserRole, getSystemStats } from '../../services/firebaseService';
import Navbar from '../layout/Navbar';
import LoadingSpinner from '../shared/LoadingSpinner';

const AdminDashboard = () => {
    const { userProfile } = useAuth();
    // const navigate = useNavigate(); // Unused

    const [users, setUsers] = useState([]);
    const [tenders, setTenders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, users, tenders
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersData, tendersData, statsData] = await Promise.all([
                getAllUsers(),
                getAllTenders(),
                getSystemStats()
            ]);

            setUsers(usersData);
            setTenders(tendersData);
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        if (!window.confirm(`Change user role to ${newRole}?`)) return;

        setProcessing(true);
        try {
            await updateUserRole(userId, newRole);
            alert('User role updated successfully!');
            await fetchData(); // Refresh data
        } catch (error) {
            alert('Failed to update role: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'VENDOR': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'EVALUATOR': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'PROCUREMENT_OFFICER': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'ADMIN': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-green-100 text-green-800 border-green-200';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'EVALUATING': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) return (
        <>
            <Navbar />
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                <LoadingSpinner />
            </div>
        </>
    );

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            Admin Control Center
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage users, oversee tenders, and monitor system health
                        </p>
                    </div>

                    {/* Statistics Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="card bg-white p-6 shadow-sm rounded-xl border border-slate-200">
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Users</p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-3xl font-semibold text-slate-900">{stats.totalUsers}</span>
                                </div>
                                <div className="mt-4 text-xs font-medium text-slate-400">
                                    V:{stats.usersByRole.vendors} | E:{stats.usersByRole.evaluators} | P:{stats.usersByRole.procurement}
                                </div>
                            </div>

                            <div className="card bg-white p-6 shadow-sm rounded-xl border border-slate-200">
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Tenders</p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-3xl font-semibold text-slate-900">{stats.totalTenders}</span>
                                </div>
                                <div className="mt-4 text-xs font-medium text-slate-400">
                                    Open: {stats.tendersByStatus.open} | Done: {stats.tendersByStatus.completed}
                                </div>
                            </div>

                            <div className="card bg-white p-6 shadow-sm rounded-xl border border-slate-200">
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Bids</p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-3xl font-semibold text-slate-900">{stats.totalBids}</span>
                                </div>
                                <div className="mt-4 text-xs font-medium text-slate-400">
                                    Pending: {stats.bidsByStatus.submitted}
                                </div>
                            </div>

                            <div className="card bg-white p-6 shadow-sm rounded-xl border border-slate-200">
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Approval Rate</p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-3xl font-semibold text-slate-900">
                                        {stats.totalBids > 0
                                            ? Math.round((stats.bidsByStatus.approved / stats.totalBids) * 100)
                                            : 0}%
                                    </span>
                                </div>
                                <div className="mt-4 text-xs font-medium text-slate-400">
                                    ✓ {stats.bidsByStatus.approved} | ✗ {stats.bidsByStatus.rejected}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Navigation */}
                    <div className="border-b border-slate-200 mb-6">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {['overview', 'users', 'tenders'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`${activeTab === tab
                                            ? 'border-primary-500 text-primary-600'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm uppercase tracking-wide`}
                                >
                                    {tab === 'users' ? 'User Management' : tab === 'tenders' ? 'Tender Oversight' : 'Overview'}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="card bg-white p-6 shadow-sm rounded-xl border border-slate-200">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">User Distribution</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                            <span className="font-medium text-slate-700">Vendors</span>
                                            <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm">{stats?.usersByRole.vendors || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                            <span className="font-medium text-slate-700">Evaluators</span>
                                            <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm">{stats?.usersByRole.evaluators || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                            <span className="font-medium text-slate-700">Procurement</span>
                                            <span className="font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-sm">{stats?.usersByRole.procurement || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                            <span className="font-medium text-slate-700">Admins</span>
                                            <span className="font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">{stats?.usersByRole.admins || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card bg-white p-6 shadow-sm rounded-xl border border-slate-200">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Tender Status</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                            <span className="font-medium text-slate-700">Open Tenders</span>
                                            <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">{stats?.tendersByStatus.open || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                            <span className="font-medium text-slate-700">Completed</span>
                                            <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm">{stats?.tendersByStatus.completed || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                            <span className="font-medium text-slate-700">Evaluating</span>
                                            <span className="font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">{stats?.tendersByStatus.evaluating || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-sm p-6 text-white">
                                <h3 className="text-lg font-bold mb-2">Admin Actions</h3>
                                <p className="text-slate-300 text-sm">
                                    Use the tabs above to manage users and oversee tenders. You can change user roles,
                                    view tender details, and monitor the entire platform from this dashboard.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* User Management Tab */}
                    {activeTab === 'users' && (
                        <div className="card bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900">User Management ({users.length})</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Company</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.displayName || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeClass(user.role)}`}>
                                                        {user.role?.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.companyName || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                        disabled={processing || user.id === userProfile?.uid}
                                                        className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6 disabled:opacity-50 disabled:bg-slate-50"
                                                    >
                                                        <option value="VENDOR">Vendor</option>
                                                        <option value="EVALUATOR">Evaluator</option>
                                                        <option value="PROCUREMENT_OFFICER">Procurement</option>
                                                        <option value="ADMIN">Admin</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Tender Oversight Tab */}
                    {activeTab === 'tenders' && (
                        <div className="space-y-4">
                            {tenders.map((tender) => (
                                <div key={tender.id} className="card bg-white p-6 shadow-sm rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{tender.title}</h3>
                                            <p className="text-sm text-slate-500 mt-1 line-clamp-1">{tender.description}</p>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(tender.status)}`}>
                                            {tender.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-t border-slate-100">
                                        <div>
                                            <span className="text-xs font-medium text-slate-500 uppercase">Deadline:</span>
                                            <div className="mt-1 text-sm font-semibold text-slate-900">
                                                {new Date(tender.deadline?.seconds * 1000).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-slate-500 uppercase">Budget:</span>
                                            <div className="mt-1 text-sm font-semibold text-slate-900">{tender.budget || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-slate-500 uppercase">Criteria:</span>
                                            <div className="mt-1 text-sm font-semibold text-slate-900">{tender.criteria?.length || 0}</div>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-slate-500 uppercase">Created:</span>
                                            <div className="mt-1 text-sm font-semibold text-slate-900">
                                                {new Date(tender.createdAt?.seconds * 1000).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    {tender.winningBidId && (
                                        <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center gap-2 text-emerald-700">
                                            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-xs font-bold uppercase">Winner Selected: Bid #{tender.winningBidId.slice(0, 8)}</span>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {tenders.length === 0 && (
                                <div className="text-center p-12 bg-white rounded-xl border border-slate-200">
                                    <p className="text-slate-500 font-medium">No tenders found</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
