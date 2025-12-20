// Navbar Component - Professional Style
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
            case 'VENDOR': return '/vendor/dashboard';
            case 'PROCUREMENT_OFFICER': return '/procurement/dashboard';
            case 'EVALUATOR': return '/evaluator/dashboard';
            case 'ADMIN': return '/admin/dashboard';
            default: return '/';
        }
    };

    const getRoleBadgeClasses = () => {
        switch (userProfile?.role) {
            case 'VENDOR': return 'bg-blue-100 text-blue-800';
            case 'PROCUREMENT_OFFICER': return 'bg-purple-100 text-purple-800';
            case 'EVALUATOR': return 'bg-emerald-100 text-emerald-800';
            case 'ADMIN': return 'bg-gray-800 text-white';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to={getDashboardLink()} className="flex-shrink-0 flex items-center gap-2">
                            <div className="h-8 w-8 bg-primary-900 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                A
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-900 to-primary-600">
                                AI BidEval
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <>
                                <div className="hidden md:flex flex-col items-end mr-2">
                                    <span className="text-sm font-medium text-slate-900">
                                        {userProfile?.displayName || user.email}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${getRoleBadgeClasses()}`}>
                                        {userProfile?.role?.replace('_', ' ')}
                                    </span>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                                >
                                    Log out
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
