// Login Component
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../services/firebaseService';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login(email, password);
            // Fetch user profile directly to get the correct role
            const profile = await getUserProfile(user.uid);
            redirectBasedOnRole(profile.role);
        } catch (err) {
            setError('Failed to login: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            const user = await loginWithGoogle();
            // Fetch user profile directly to get the correct role
            const profile = await getUserProfile(user.uid);
            redirectBasedOnRole(profile.role);
        } catch (err) {
            setError('Failed to login with Google: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const redirectBasedOnRole = (role) => {
        switch (role) {
            case 'VENDOR':
                navigate('/vendor/dashboard');
                break;
            case 'PROCUREMENT_OFFICER':
                navigate('/procurement/dashboard');
                break;
            case 'EVALUATOR':
                navigate('/evaluator/dashboard');
                break;
            case 'ADMIN':
                navigate('/admin/dashboard');
                break;
            default:
                navigate('/');
        }
    };

    return (
        <div className="page-brutal" style={{ backgroundColor: '#F5F5F5' }}>
            <div className="max-w-md w-full mx-auto px-4">
                <div className="card">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <span className="text-4xl font-black" style={{ color: '#4285F4' }}>AI</span>
                            <span className="text-4xl font-black mx-1" style={{ color: '#EA4335' }}>Bid</span>
                            <span className="text-4xl font-black" style={{ color: '#FBBC04' }}>Eval</span>
                            <span className="text-4xl font-black ml-1" style={{ color: '#34A853' }}>✓</span>
                        </div>
                        <h1 className="text-3xl font-black text-black mb-2 uppercase tracking-tight">
                            Login
                        </h1>
                        <p className="text-black font-semibold">Access your account</p>
                    </div>

                    {error && (
                        <div className="alert-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="label">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="label">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'LOGGING IN...' : 'LOGIN'}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="divider"></div>
                        <div className="relative flex justify-center -mt-4">
                            <span className="px-4 bg-white text-black font-bold text-sm uppercase">Or continue with</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="mt-6 w-full btn-secondary flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span className="font-bold">GOOGLE</span>
                    </button>

                    <p className="mt-8 text-center text-sm font-semibold text-black">
                        Don't have an account?{' '}
                        <Link to="/register" className="link-brutal" style={{ color: '#4285F4' }}>
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
