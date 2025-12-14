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
                            Create Account
                        </h1>
                        <p className="text-black font-semibold">Join the platform</p>
                    </div>

                    {error && (
                        <div className="alert-error">
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
                            {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm font-semibold text-black">
                        Already have an account?{' '}
                        <Link to="/login" className="link-brutal" style={{ color: '#4285F4' }}>
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
