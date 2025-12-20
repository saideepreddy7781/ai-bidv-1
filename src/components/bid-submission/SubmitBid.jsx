// Bid Submission Form Component - Professional Style
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTenderById, submitBid } from '../../services/firebaseService';
import { analyzeDocument, checkCompliance } from '../../services/geminiService';
import Navbar from '../layout/Navbar';
import LoadingSpinner from '../shared/LoadingSpinner';

const SubmitBid = () => {
    const { tenderId } = useParams();
    const { userProfile } = useAuth();
    const navigate = useNavigate();

    const [tender, setTender] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState('');

    const [bidData, setBidData] = useState({
        proposalText: '',
        technicalApproach: '',
        proposedCost: '',
        timeline: '',
        teamSize: '',
        experience: '',
        certifications: ''
    });

    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [complianceCheck, setComplianceCheck] = useState(null);

    useEffect(() => {
        const fetchTender = async () => {
            try {
                const tenderData = await getTenderById(tenderId);
                if (!tenderData) {
                    setError('Tender not found');
                } else if (tenderData.status === 'COMPLETED' || tenderData.status === 'CLOSED') {
                    setError('This tender is no longer accepting bids - it has been completed.');
                    setTender(null);
                } else {
                    setTender(tenderData);
                }
            } catch (err) {
                setError('Failed to load tender: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTender();
    }, [tenderId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBidData({ ...bidData, [name]: value });
    };

    const handleAnalyze = async () => {
        if (!bidData.proposalText) {
            setError('Please enter your proposal text first');
            return;
        }

        setAnalyzing(true);
        setError('');

        try {
            // Combine all bid data into a document
            const documentText = `
PROPOSAL TEXT:
${bidData.proposalText}

TECHNICAL APPROACH:
${bidData.technicalApproach}

PROPOSED COST: ${bidData.proposedCost}
TIMELINE: ${bidData.timeline}
TEAM SIZE: ${bidData.teamSize}
EXPERIENCE: ${bidData.experience}
CERTIFICATIONS: ${bidData.certifications}
      `.trim();

            // Analyze document with Gemini
            const analysis = await analyzeDocument(documentText);
            setAiAnalysis(analysis);

            // Check compliance
            const compliance = await checkCompliance(
                {
                    proposalText: bidData.proposalText,
                    proposedCost: bidData.proposedCost,
                    experience: bidData.experience,
                    certifications: bidData.certifications
                },
                tender.requirements
            );
            setComplianceCheck(compliance);

        } catch (err) {
            setError('AI Analysis failed: ' + err.message);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const currentTender = await getTenderById(tenderId);

            if (!currentTender) {
                setError('Tender not found');
                setSubmitting(false);
                return;
            }

            if (currentTender.status === 'COMPLETED' || currentTender.status === 'CLOSED') {
                setError('This tender has been closed and is no longer accepting bids.');
                setSubmitting(false);
                setTender(null);
                return;
            }

            if (!bidData.proposalText) {
                setError('Please provide a proposal summary');
                setSubmitting(false);
                return;
            }

            const bidSubmission = {
                tenderId: tenderId,
                vendorId: userProfile.uid,
                vendorName: userProfile.displayName,
                companyName: userProfile.companyName || 'Not Specified',
                bidData: bidData,
                aiAnalysis: aiAnalysis,
                complianceCheck: complianceCheck,
                status: 'SUBMITTED'
            };

            await submitBid(bidSubmission);
            alert('Bid submitted successfully!');
            navigate('/vendor/dashboard');
        } catch (err) {
            setError('Failed to submit bid: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <>
            <Navbar />
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                <LoadingSpinner />
            </div>
        </>
    );

    if (error && !tender) return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Unavailable</h2>
                    <p className="text-slate-500 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/vendor/dashboard')}
                        className="btn-primary w-full justify-center"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="flex mb-4" aria-label="Breadcrumb">
                        <ol role="list" className="flex items-center space-x-4">
                            <li>
                                <div>
                                    <Link to="/vendor/dashboard" className="text-slate-400 hover:text-slate-500">
                                        <span className="sr-only">Home</span>
                                        <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
                                        </svg>
                                    </Link>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 flex-shrink-0 text-slate-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                                    </svg>
                                    <span className="ml-4 text-sm font-medium text-slate-500">Submit Bid</span>
                                </div>
                            </li>
                        </ol>
                    </nav>

                    <div className="md:flex md:items-center md:justify-between mb-8">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                                Submit Bid: {tender.title}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">{tender.description}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {error && (
                                <div className="rounded-md bg-red-50 p-4 border border-red-200">
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

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="card">
                                    <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">Proposal Details</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="label">Proposal Summary <span className="text-red-500">*</span></label>
                                            <textarea
                                                name="proposalText"
                                                value={bidData.proposalText}
                                                onChange={handleChange}
                                                rows={6}
                                                className="input-field"
                                                placeholder="Provide a comprehensive overview of your proposal..."
                                                required
                                            />
                                            <p className="mt-2 text-xs text-slate-500">
                                                This will be analyzed by AI to extract key information and match against requirements.
                                            </p>
                                        </div>

                                        <div>
                                            <label className="label">Technical Approach</label>
                                            <textarea
                                                name="technicalApproach"
                                                value={bidData.technicalApproach}
                                                onChange={handleChange}
                                                rows={4}
                                                className="input-field"
                                                placeholder="Describe your technical solution and methodology..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">Project Specifics</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="label">Proposed Cost</label>
                                            <div className="relative mt-2 rounded-md shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="text-slate-500 sm:text-sm">$</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    name="proposedCost"
                                                    value={bidData.proposedCost}
                                                    onChange={handleChange}
                                                    className="input-field pl-7"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="label">Estimated Timeline</label>
                                            <input
                                                type="text"
                                                name="timeline"
                                                value={bidData.timeline}
                                                onChange={handleChange}
                                                className="input-field mt-2"
                                                placeholder="e.g., 6 months"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">Qualifications</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="label">Team Size</label>
                                            <input
                                                type="text"
                                                name="teamSize"
                                                value={bidData.teamSize}
                                                onChange={handleChange}
                                                className="input-field mt-2"
                                                placeholder="e.g., 5 members"
                                            />
                                        </div>

                                        <div>
                                            <label className="label">Years of Experience</label>
                                            <input
                                                type="text"
                                                name="experience"
                                                value={bidData.experience}
                                                onChange={handleChange}
                                                className="input-field mt-2"
                                                placeholder="e.g., 8 years"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label">Certifications</label>
                                        <input
                                            type="text"
                                            name="certifications"
                                            value={bidData.certifications}
                                            onChange={handleChange}
                                            className="input-field mt-2"
                                            placeholder="e.g., ISO9001, ISO27001"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/vendor/dashboard')}
                                        className="text-sm font-semibold leading-6 text-slate-900 px-4 py-2 rounded-md hover:bg-slate-50"
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Bid'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Right Column: AI Analysis */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="card bg-slate-800 text-white border-slate-700">
                                <h3 className="text-lg font-bold text-white mb-2">AI Pre-check</h3>
                                <p className="text-slate-300 text-sm mb-4">
                                    Analyze your bid before submission to see how well it matches requirements.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleAnalyze}
                                    disabled={analyzing || !bidData.proposalText}
                                    className="w-full btn-primary bg-white text-slate-900 hover:bg-slate-100 border-transparent disabled:bg-slate-700 disabled:text-slate-500"
                                >
                                    {analyzing ? 'Analyzing...' : 'Run Analysis'}
                                </button>
                            </div>

                            {/* Analysis Results */}
                            {(aiAnalysis || complianceCheck) && (
                                <div className="space-y-6">
                                    {complianceCheck && (
                                        <div className={`rounded-lg p-4 border ${complianceCheck.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`p-1.5 rounded-full ${complianceCheck.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                    {complianceCheck.passed ? (
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <h4 className={`font-bold ${complianceCheck.passed ? 'text-emerald-900' : 'text-amber-900'}`}>
                                                    Compliance Score: {complianceCheck.score}/100
                                                </h4>
                                            </div>

                                            {complianceCheck.issues && complianceCheck.issues.length > 0 && (
                                                <div className="mb-3">
                                                    <p className={`text-xs font-bold uppercase mb-1 ${complianceCheck.passed ? 'text-emerald-800' : 'text-amber-800'}`}>Issues Found:</p>
                                                    <ul className={`list-disc list-inside text-sm ${complianceCheck.passed ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                        {complianceCheck.issues.map((issue, idx) => (
                                                            <li key={idx}>{issue}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {aiAnalysis && (
                                        <div className="card bg-white border border-slate-200 shadow-sm">
                                            <h4 className="font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">AI Summary</h4>
                                            <p className="text-sm text-slate-600 mb-4">{aiAnalysis.summary}</p>

                                            {aiAnalysis.strengths && aiAnalysis.strengths.length > 0 && (
                                                <div>
                                                    <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Identified Strengths</h5>
                                                    <ul className="space-y-1">
                                                        {aiAnalysis.strengths.map((strength, idx) => (
                                                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                                                <svg className="h-5 w-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                {strength}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SubmitBid;
