// Protected Route Component
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../shared/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, userProfile, loading, error } = useAuth();

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Show loading while userProfile is being fetched
    if (!userProfile) {
        if (error) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                    <div className="max-w-lg w-full bg-white shadow-lg rounded-xl p-8 border border-slate-200 text-center">
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Profile Access Issue</h2>
                        <p className="text-slate-600 mb-4">{error}</p>
                        <p className="text-sm text-slate-500 mb-6">
                            This usually happens when Firestore rules block reading users/{'{uid}'} or the profile document does not exist.
                        </p>
                        <a
                            href="/login"
                            className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                        >
                            Back to Login
                        </a>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    // Check role-based access
    if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 border border-slate-200 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-600 mb-6">
                        You do not have permission to access this page.
                    </p>
                    <div className="flex flex-col gap-3">
                        <div className="inline-block bg-slate-100 rounded-lg px-3 py-2 text-sm text-slate-700">
                            Your Role: <span className="font-semibold">{userProfile.role}</span>
                        </div>
                        <a href="/" className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Go to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
