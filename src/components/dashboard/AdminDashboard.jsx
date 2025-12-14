// Admin Dashboard
import Navbar from '../layout/Navbar';

const AdminDashboard = () => {
    return (
        <>
            <Navbar />
            <div className="page-brutal">
                <div className="container-brutal">
                    <div className="card mb-8">
                        <h1 className="text-4xl font-black text-black mb-2 uppercase tracking-tight">
                            Admin Dashboard
                        </h1>
                        <p className="text-black font-bold">
                            Manage users, tenders, and system settings
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="stat-card-blue">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <h3 className="text-2xl font-black mb-2 uppercase">User Management</h3>
                            <p className="font-bold">Manage roles and permissions</p>
                        </div>

                        <div className="stat-card-yellow">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-2xl font-black mb-2 uppercase">Tender Oversight</h3>
                            <p className="font-bold">Monitor all tenders</p>
                        </div>

                        <div className="stat-card-green">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <h3 className="text-2xl font-black mb-2 uppercase">System Analytics</h3>
                            <p className="font-bold">View platform statistics</p>
                        </div>
                    </div>

                    <div className="mt-8 alert-warning">
                        📊 Advanced admin features are under development
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
