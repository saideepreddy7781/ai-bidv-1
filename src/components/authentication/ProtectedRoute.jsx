// Protected Route Component
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../shared/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, userProfile, loading } = useAuth();

    // Show loading while checking authentication
    if (loading) {
        return <LoadingSpinner />;
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Show loading while userProfile is being fetched
    if (!userProfile) {
        return <LoadingSpinner />;
    }

    // Check role-based access
    if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-4">
                        You don't have permission to access this page.
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                        Your role: <span className="font-semibold">{userProfile.role}</span>
                    </p>
                    <a href="/" className="btn-primary">Go to Home</a>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
