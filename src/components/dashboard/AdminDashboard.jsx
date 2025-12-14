// Admin Dashboard
import Navbar from '../layout/Navbar';

const AdminDashboard = () => {
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Manage users, tenders, and system settings
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="border border-gray-200 rounded-lg p-6 text-center">
                                <svg className="w-12 h-12 text-purple-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <h3 className="font-semibold text-gray-900 mb-2">User Management</h3>
                                <p className="text-sm text-gray-600">Manage roles and permissions</p>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-6 text-center">
                                <svg className="w-12 h-12 text-blue-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="font-semibold text-gray-900 mb-2">Tender Oversight</h3>
                                <p className="text-sm text-gray-600">Monitor all tenders</p>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-6 text-center">
                                <svg className="w-12 h-12 text-green-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <h3 className="font-semibold text-gray-900 mb-2">System Analytics</h3>
                                <p className="text-sm text-gray-600">View platform statistics</p>
                            </div>
                        </div>

                        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-800">
                                📊 Advanced admin features are under development
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
