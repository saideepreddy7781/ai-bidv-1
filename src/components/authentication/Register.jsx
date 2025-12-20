// Register Component - Professional Style
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../utils/constants';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        role: 'VENDOR',
        companyName: '',
        registrationNumber: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        if (formData.role === 'VENDOR' && !formData.companyName) {
            return setError('Company name is required for vendors');
        }

        setLoading(true);

        try {
            const userData = {
                displayName: formData.displayName,
                role: formData.role,
                ...(formData.role === 'VENDOR' && {
                    companyName: formData.companyName,
                    registrationNumber: formData.registrationNumber
                })
            };

            await register(formData.email, formData.password, userData);

            // Redirect based on role
            switch (formData.role) {
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
        } catch (err) {
            setError('Failed to create account: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="flex items-center gap-1.5">
                        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white p-2 rounded-lg shadow-lg">
                            <span className="text-2xl font-bold tracking-tight">AI</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-800 tracking-tight">BidEval</span>
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                        Sign in instead
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-slate-700">
                                Full Name
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="displayName"
                                    id="displayName"
                                    required
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700">
                                Role
                            </label>
                            <div className="mt-1">
                                <select
                                    name="role"
                                    id="role"
                                    required
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value={USER_ROLES.VENDOR}>Vendor</option>
                                    <option value={USER_ROLES.PROCUREMENT_OFFICER}>Procurement Officer</option>
                                    <option value={USER_ROLES.EVALUATOR}>Evaluator</option>
                                    <option value={USER_ROLES.ADMIN}>Admin</option>
                                </select>
                            </div>
                        </div>

                        {formData.role === 'VENDOR' && (
                            <div className="space-y-6 pt-2 border-t border-slate-100">
                                <div>
                                    <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">
                                        Company Name
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="companyName"
                                            id="companyName"
                                            required
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="ABC Corporation"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="registrationNumber" className="block text-sm font-medium text-slate-700">
                                        Registration Number (Optional)
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="registrationNumber"
                                            id="registrationNumber"
                                            value={formData.registrationNumber}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="REG123456"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                                Confirm Password
                            </label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary flex justify-center py-2 px-4"
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
