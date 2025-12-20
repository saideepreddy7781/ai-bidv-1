// Create Tender Form Component - Professional Style
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
            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Create New Tender</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Fill in the details below to publish a new tender opportunity.
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4 mb-6 border border-red-200">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                                    <div className="mt-2 text-sm text-red-700">{error}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Information */}
                        <div className="bg-white shadow-sm ring-1 ring-slate-900/5 sm:rounded-xl">
                            <div className="px-4 py-6 sm:p-8">
                                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div className="sm:col-span-full">
                                        <h2 className="text-base font-semibold leading-7 text-slate-900">Basic Information</h2>
                                        <p className="mt-1 text-sm leading-6 text-slate-500">General details about the project.</p>
                                    </div>

                                    <div className="sm:col-span-4">
                                        <label htmlFor="title" className="block text-sm font-medium leading-6 text-slate-900">
                                            Tender Title <span className="text-red-500">*</span>
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="text"
                                                name="title"
                                                id="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                                placeholder="e.g., Website Development Project"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-full">
                                        <label htmlFor="description" className="block text-sm font-medium leading-6 text-slate-900">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <div className="mt-2">
                                            <textarea
                                                id="description"
                                                name="description"
                                                rows={4}
                                                value={formData.description}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                                placeholder="Detailed description of the tender requirements..."
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="deadline" className="block text-sm font-medium leading-6 text-slate-900">
                                            Submission Deadline <span className="text-red-500">*</span>
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="datetime-local"
                                                name="deadline"
                                                id="deadline"
                                                value={formData.deadline}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Requirements */}
                        <div className="bg-white shadow-sm ring-1 ring-slate-900/5 sm:rounded-xl">
                            <div className="px-4 py-6 sm:p-8">
                                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div className="sm:col-span-full">
                                        <h2 className="text-base font-semibold leading-7 text-slate-900">Requirements</h2>
                                        <p className="mt-1 text-sm leading-6 text-slate-500">Specific qualifications needed from vendors.</p>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium leading-6 text-slate-900">
                                            Min. Experience (years)
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="number"
                                                name="req_minExperience"
                                                value={formData.requirements.minExperience}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                                placeholder="e.g., 5"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-4">
                                        <label className="block text-sm font-medium leading-6 text-slate-900">
                                            Required Certifications
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="text"
                                                name="req_requiredCertifications"
                                                value={formData.requirements.requiredCertifications}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                                placeholder="e.g., ISO9001, ISO27001 (comma separated)"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-full">
                                        <label className="block text-sm font-medium leading-6 text-slate-900">
                                            Other Requirements
                                        </label>
                                        <div className="mt-2">
                                            <textarea
                                                name="req_otherRequirements"
                                                value={formData.requirements.otherRequirements}
                                                onChange={handleChange}
                                                rows={3}
                                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                                placeholder="Any additional requirements..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Evaluation Criteria */}
                        <div className="bg-white shadow-sm ring-1 ring-slate-900/5 sm:rounded-xl">
                            <div className="px-4 py-6 sm:p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-base font-semibold leading-7 text-slate-900">Evaluation Criteria</h2>
                                        <p className="mt-1 text-sm leading-6 text-slate-500">Define how bids will be scored.</p>
                                    </div>
                                    <div className={`text-sm font-bold px-3 py-1 rounded-full ${criteria.reduce((sum, c) => sum + c.weight, 0) === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                        Total Weight: {criteria.reduce((sum, c) => sum + c.weight, 0)}%
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {criteria.map((criterion, index) => (
                                        <div key={index} className="relative bg-slate-50 rounded-lg p-4 ring-1 ring-slate-200">
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                                <div className="md:col-span-5">
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Criterion Name</label>
                                                    <input
                                                        type="text"
                                                        value={criterion.name}
                                                        onChange={(e) => handleCriteriaChange(index, 'name', e.target.value)}
                                                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                                        placeholder="e.g., Technical Capability"
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Weight (%)</label>
                                                    <input
                                                        type="number"
                                                        value={criterion.weight}
                                                        onChange={(e) => handleCriteriaChange(index, 'weight', e.target.value)}
                                                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                                        min="0"
                                                        max="100"
                                                    />
                                                </div>

                                                <div className="md:col-span-4">
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                                                    <input
                                                        type="text"
                                                        value={criterion.description}
                                                        onChange={(e) => handleCriteriaChange(index, 'description', e.target.value)}
                                                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                                        placeholder="Criteria description"
                                                    />
                                                </div>

                                                <div className="md:col-span-1 flex items-end justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCriterion(index)}
                                                        className="text-red-600 hover:text-red-900 p-2"
                                                        disabled={criteria.length <= 1}
                                                    >
                                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={addCriterion}
                                    className="mt-4 flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
                                >
                                    <svg className="mr-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                    </svg>
                                    Add Criterion
                                </button>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex items-center justify-end gap-x-4">
                            <button
                                type="button"
                                onClick={() => navigate('/procurement/dashboard')}
                                className="text-sm font-semibold leading-6 text-slate-900"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Tender'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateTender;
