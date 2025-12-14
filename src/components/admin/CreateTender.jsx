// Create Tender Form Component
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createTender } from '../../services/firebaseService';
import { DEFAULT_EVALUATION_CRITERIA } from '../../utils/constants';
import Navbar from '../layout/Navbar';

const CreateTender = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        requirements: {
            minExperience: '',
            requiredCertifications: '',
            otherRequirements: ''
        }
    });
    const [criteria, setCriteria] = useState(DEFAULT_EVALUATION_CRITERIA);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('req_')) {
            const reqName = name.replace('req_', '');
            setFormData({
                ...formData,
                requirements: {
                    ...formData.requirements,
                    [reqName]: value
                }
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleCriteriaChange = (index, field, value) => {
        const newCriteria = [...criteria];
        newCriteria[index][field] = field === 'weight' ? parseInt(value) || 0 : value;
        setCriteria(newCriteria);
    };

    const addCriterion = () => {
        setCriteria([...criteria, { name: '', weight: 0, description: '' }]);
    };

    const removeCriterion = (index) => {
        setCriteria(criteria.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.title || !formData.description || !formData.deadline) {
            return setError('Please fill in all required fields');
        }

        const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
        if (totalWeight !== 100) {
            return setError(`Criteria weights must total 100% (currently ${totalWeight}%)`);
        }

        setLoading(true);

        try {
            const tenderData = {
                ...formData,
                deadline: new Date(formData.deadline),
                criteria: criteria.filter(c => c.name && c.weight > 0),
                createdBy: userProfile.uid,
                requirements: {
                    minExperience: formData.requirements.minExperience,
                    requiredCertifications: formData.requirements.requiredCertifications
                        .split(',')
                        .map(cert => cert.trim())
                        .filter(cert => cert),
                    otherRequirements: formData.requirements.otherRequirements
                }
            };

            await createTender(tenderData);
            navigate('/procurement/dashboard');
        } catch (err) {
            setError('Failed to create tender: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Tender</h1>

                        {error && (
                            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="label">Tender Title *</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="e.g., Website Development Project"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Description *</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={4}
                                            className="input-field"
                                            placeholder="Detailed description of the tender requirements..."
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Submission Deadline *</label>
                                        <input
                                            type="datetime-local"
                                            name="deadline"
                                            value={formData.deadline}
                                            onChange={handleChange}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Requirements */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="label">Minimum Experience (years)</label>
                                        <input
                                            type="number"
                                            name="req_minExperience"
                                            value={formData.requirements.minExperience}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="e.g., 5"
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Required Certifications (comma-separated)</label>
                                        <input
                                            type="text"
                                            name="req_requiredCertifications"
                                            value={formData.requirements.requiredCertifications}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="e.g., ISO9001, ISO27001"
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Other Requirements</label>
                                        <textarea
                                            name="req_otherRequirements"
                                            value={formData.requirements.otherRequirements}
                                            onChange={handleChange}
                                            rows={3}
                                            className="input-field"
                                            placeholder="Any additional requirements..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Evaluation Criteria */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Evaluation Criteria
                                    </h2>
                                    <span className="text-sm text-gray-600">
                                        Total: {criteria.reduce((sum, c) => sum + c.weight, 0)}%
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {criteria.map((criterion, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="md:col-span-1">
                                                    <label className="label text-sm">Criterion Name</label>
                                                    <input
                                                        type="text"
                                                        value={criterion.name}
                                                        onChange={(e) => handleCriteriaChange(index, 'name', e.target.value)}
                                                        className="input-field"
                                                        placeholder="e.g., Technical Capability"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="label text-sm">Weight (%)</label>
                                                    <input
                                                        type="number"
                                                        value={criterion.weight}
                                                        onChange={(e) => handleCriteriaChange(index, 'weight', e.target.value)}
                                                        className="input-field"
                                                        min="0"
                                                        max="100"
                                                    />
                                                </div>

                                                <div className="flex items-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCriterion(index)}
                                                        className="btn-danger w-full"
                                                        disabled={criteria.length <= 1}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <label className="label text-sm">Description</label>
                                                <textarea
                                                    value={criterion.description}
                                                    onChange={(e) => handleCriteriaChange(index, 'description', e.target.value)}
                                                    rows={2}
                                                    className="input-field"
                                                    placeholder="What will be evaluated under this criterion?"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={addCriterion}
                                    className="mt-4 btn-secondary"
                                >
                                    + Add Criterion
                                </button>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => navigate('/procurement/dashboard')}
                                    className="btn-secondary flex-1"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary flex-1"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating...' : 'Create Tender'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateTender;
