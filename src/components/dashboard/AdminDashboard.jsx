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
            case 'VENDOR': return 'badge-blue';
            case 'EVALUATOR': return 'badge-green';
            case 'PROCUREMENT_OFFICER': return 'badge-red';
            case 'ADMIN': return 'badge-yellow';
            default: return 'border-4 border-black px-3 py-1 font-bold';
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'OPEN': return 'badge-green';
            case 'COMPLETED': return 'border-4 border-black bg-gray-400 text-white px-3 py-1 font-bold uppercase text-xs';
            case 'EVALUATING': return 'badge-yellow';
            default: return 'border-4 border-black px-3 py-1 font-bold';
        }
    };

    if (loading) return (
        <>
            <Navbar />
            <LoadingSpinner />
        </>
    );

    return (
        <>
            <Navbar />
            <div className="page-brutal">
                <div className="container-brutal max-w-7xl">
                    {/* Header */}
                    <div className="card mb-8">
                        <h1 className="text-4xl font-black text-black mb-2 uppercase">Admin Control Center</h1>
                        <p className="text-black font-bold">Manage users, oversee tenders, and monitor system health</p>
                    </div>

                    {/* Statistics Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="stat-card-blue">
                                <div className="text-5xl font-black mb-2">{stats.totalUsers}</div>
                                <div className="text-sm uppercase font-bold opacity-90">Total Users</div>
                                <div className="mt-3 text-xs font-semibold">
                                    V:{stats.usersByRole.vendors} | E:{stats.usersByRole.evaluators} | P:{stats.usersByRole.procurement}
                                </div>
                            </div>

                            <div className="stat-card-green">
                                <div className="text-5xl font-black mb-2">{stats.totalTenders}</div>
                                <div className="text-sm uppercase font-bold opacity-90">Total Tenders</div>
                                <div className="mt-3 text-xs font-semibold">
                                    Open: {stats.tendersByStatus.open} | Done: {stats.tendersByStatus.completed}
                                </div>
                            </div>

                            <div className="stat-card-yellow">
                                <div className="text-5xl font-black mb-2">{stats.totalBids}</div>
                                <div className="text-sm uppercase font-bold opacity-90">Total Bids</div>
                                <div className="mt-3 text-xs font-semibold">
                                    Pending: {stats.bidsByStatus.submitted}
                                </div>
                            </div>

                            <div className="stat-card-red">
                                <div className="text-5xl font-black mb-2">
                                    {stats.totalBids > 0
                                        ? Math.round((stats.bidsByStatus.approved / stats.totalBids) * 100)
                                        : 0}%
                                </div>
                                <div className="text-sm uppercase font-bold opacity-90">Approval Rate</div>
                                <div className="mt-3 text-xs font-semibold">
                                    ✓ {stats.bidsByStatus.approved} | ✗ {stats.bidsByStatus.rejected}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Navigation */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}
                        >
                            OVERVIEW
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}
                        >
                            USER MANAGEMENT
                        </button>
                        <button
                            onClick={() => setActiveTab('tenders')}
                            className={activeTab === 'tenders' ? 'btn-primary' : 'btn-secondary'}
                        >
                            TENDER OVERSIGHT
                        </button>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="card">
                            <h2 className="text-2xl font-black text-black mb-6 uppercase">System Overview</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border-4 border-black p-6 bg-gray-50">
                                    <h3 className="font-black text-black mb-4 uppercase text-sm">User Distribution</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="font-bold">Vendors:</span>
                                            <span className="font-black text-google-blue">{stats?.usersByRole.vendors || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-bold">Evaluators:</span>
                                            <span className="font-black text-google-green">{stats?.usersByRole.evaluators || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-bold">Procurement:</span>
                                            <span className="font-black text-google-red">{stats?.usersByRole.procurement || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-bold">Admins:</span>
                                            <span className="font-black text-google-yellow">{stats?.usersByRole.admins || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-4 border-black p-6 bg-gray-50">
                                    <h3 className="font-black text-black mb-4 uppercase text-sm">Tender Status</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="font-bold">Open Tenders:</span>
                                            <span className="font-black text-google-green">{stats?.tendersByStatus.open || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-bold">Completed:</span>
                                            <span className="font-black">{stats?.tendersByStatus.completed || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-bold">Evaluating:</span>
                                            <span className="font-black text-google-yellow">{stats?.tendersByStatus.evaluating || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-6 border-4 border-black bg-google-blue text-white">
                                <h3 className="font-black mb-2 uppercase text-sm">Admin Actions</h3>
                                <p className="font-semibold text-sm">
                                    Use the tabs above to manage users and oversee tenders. You can change user roles,
                                    view tender details, and monitor the entire platform.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* User Management Tab */}
                    {activeTab === 'users' && (
                        <div className="card">
                            <h2 className="text-2xl font-black text-black mb-6 uppercase">User Management ({users.length})</h2>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-black text-white">
                                        <tr>
                                            <th className="p-3 text-left font-black uppercase text-xs">Name</th>
                                            <th className="p-3 text-left font-black uppercase text-xs">Email</th>
                                            <th className="p-3 text-left font-black uppercase text-xs">Role</th>
                                            <th className="p-3 text-left font-black uppercase text-xs">Company</th>
                                            <th className="p-3 text-left font-black uppercase text-xs">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-4 divide-black">
                                        {users.map((user) => (
                                            <tr key={user.id} className="border-4 border-black">
                                                <td className="p-3 font-bold">{user.displayName || 'N/A'}</td>
                                                <td className="p-3 font-semibold text-sm">{user.email}</td>
                                                <td className="p-3">
                                                    <span className={getRoleBadgeClass(user.role)}>
                                                        {user.role?.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="p-3 font-semibold text-sm">{user.companyName || '-'}</td>
                                                <td className="p-3">
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                        disabled={processing || user.id === userProfile?.uid}
                                                        className="input-field text-sm py-1 px-2 disabled:opacity-50"
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
                        <div className="card">
                            <h2 className="text-2xl font-black text-black mb-6 uppercase">Tender Oversight ({tenders.length})</h2>

                            <div className="space-y-4">
                                {tenders.map((tender) => (
                                    <div key={tender.id} className="border-4 border-black p-4 bg-gray-50">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-xl font-black text-black uppercase">{tender.title}</h3>
                                                <p className="text-sm font-semibold text-black mt-1">{tender.description}</p>
                                            </div>
                                            <span className={getStatusBadgeClass(tender.status)}>
                                                {tender.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                            <div>
                                                <span className="text-xs font-bold text-black uppercase">Deadline:</span>
                                                <div className="font-black text-sm">
                                                    {new Date(tender.deadline?.seconds * 1000).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-black uppercase">Budget:</span>
                                                <div className="font-black text-sm text-google-blue">{tender.budget || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-black uppercase">Criteria:</span>
                                                <div className="font-black text-sm">{tender.criteria?.length || 0}</div>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-black uppercase">Created:</span>
                                                <div className="font-black text-sm">
                                                    {new Date(tender.createdAt?.seconds * 1000).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        {tender.winningBidId && (
                                            <div className="mt-3 p-3 border-2 border-black bg-google-green text-white">
                                                <span className="font-black text-xs uppercase">✓ Winner Selected: Bid #{tender.winningBidId.slice(0, 8)}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {tenders.length === 0 && (
                                    <div className="text-center p-8">
                                        <p className="text-black font-bold">No tenders found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
