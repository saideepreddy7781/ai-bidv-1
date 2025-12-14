// Navbar Component
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, userProfile, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const getDashboardLink = () => {
        switch (userProfile?.role) {
            case 'VENDOR':
                return '/vendor/dashboard';
            case 'PROCUREMENT_OFFICER':
                return '/procurement/dashboard';
            case 'EVALUATOR':
                return '/evaluator/dashboard';
            case 'ADMIN':
                return '/admin/dashboard';
            default:
                return '/';
        }
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to={getDashboardLink()} className="flex items-center">
                            <span className="text-2xl font-bold text-blue-600">AI Bid</span>
                            <span className="text-2xl font-bold text-gray-800 ml-1">Eval</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <>
                                <div className="text-sm">
                                    <p className="font-semibold text-gray-900">{userProfile?.displayName}</p>
                                    <p className="text-gray-500 text-xs">{userProfile?.role?.replace('_', ' ')}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="btn-secondary text-sm"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
