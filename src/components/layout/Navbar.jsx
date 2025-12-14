// Navbar Component - Neobrutalism Style
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

    const getRoleBadgeColor = () => {
        switch (userProfile?.role) {
            case 'VENDOR':
                return 'bg-blue-500 border-blue-600';
            case 'PROCUREMENT_OFFICER':
                return 'bg-red-500 border-red-600';
            case 'EVALUATOR':
                return 'bg-green-500 border-green-600';
            case 'ADMIN':
                return 'bg-yellow-400 border-yellow-500 text-black';
            default:
                return 'bg-gray-500 border-gray-600';
        }
    };

    return (
        <nav className="navbar sticky top-0 z-50">
            <div className="container-brutal">
                <div className="flex justify-between items-center h-20">
                    <Link to={getDashboardLink()} className="flex items-center gap-2">
                        <div className="flex items-center">
                            <span className="text-3xl font-black text-blue-500" style={{ color: '#4285F4' }}>AI</span>
                            <span className="text-3xl font-black text-red-500 mx-1" style={{ color: '#EA4335' }}>Bid</span>
                            <span className="text-3xl font-black text-yellow-400" style={{ color: '#FBBC04' }}>Eval</span>
                            <span className="text-3xl font-black text-green-500 ml-1" style={{ color: '#34A853' }}>✓</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-4">
                        {user && (
                            <>
                                <div className={`px-4 py-2 border-4 border-black text-white font-bold ${getRoleBadgeColor()}`}>
                                    <p className="text-sm uppercase tracking-wide">
                                        {userProfile?.displayName || 'User'}
                                    </p>
                                    <p className="text-xs opacity-90">
                                        {userProfile?.role?.replace('_', ' ')}
                                    </p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="bg-black text-white font-bold py-3 px-6 border-4 border-black shadow-[4px_4px_0px_0px_#EA4335] hover:shadow-[2px_2px_0px_0px_#EA4335] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                                >
                                    LOGOUT
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
