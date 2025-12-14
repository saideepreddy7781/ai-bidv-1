// Register Component
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Create Account
                    </h1>
                    <p className="text-gray-600">Join the AI Bid Evaluation Platform</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Full Name</label>
                        <input
                            type="text"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="input-field"
                            required
                        >
                            <option value={USER_ROLES.VENDOR}>Vendor</option>
                            <option value={USER_ROLES.PROCUREMENT_OFFICER}>Procurement Officer</option>
                            <option value={USER_ROLES.EVALUATOR}>Evaluator</option>
                            <option value={USER_ROLES.ADMIN}>Admin</option>
                        </select>
                    </div>

                    {formData.role === 'VENDOR' && (
                        <>
                            <div>
                                <label className="label">Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="ABC Corporation"
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">Registration Number (Optional)</label>
                                <input
                                    type="text"
                                    name="registrationNumber"
                                    value={formData.registrationNumber}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="REG123456"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="label">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
