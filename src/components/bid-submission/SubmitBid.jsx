// Bid Submission Form Component
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTenderById, submitBid } from '../../services/firebaseService';
import { analyzeDocument, checkCompliance, generateBidSummary } from '../../services/geminiService';
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

        // Double-check tender status before submitting
        if (tender.status === 'COMPLETED' || tender.status === 'CLOSED') {
            return setError('This tender is no longer accepting bids.');
        }

        if (!bidData.proposalText) {
            return setError('Proposal text is required');
        }

        setSubmitting(true);

        try {
            const bid = {
                tenderId: tender.id,
                vendorId: userProfile.uid,
                vendorName: userProfile.displayName,
                companyName: userProfile.companyName,
                bidData: bidData,
                aiAnalysis: aiAnalysis || null,
                complianceCheck: complianceCheck || null,
                documents: [] // Empty for now since Storage is disabled
            };

            await submitBid(bid);
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
            <LoadingSpinner />
        </>
    );

    if (error && !tender) return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600">Tender Unavailable</h2>
                    <p className="mt-2 text-gray-600">{error}</p>
                    <button
                        onClick={() => navigate('/vendor/dashboard')}
                        className="mt-4 btn-primary"
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
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Tender Info */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{tender.title}</h1>
                        <p className="text-gray-600 mb-4">{tender.description}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                            <span>Deadline: {new Date(tender.deadline?.seconds * 1000).toLocaleDateString()}</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Open</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Bid Form */}
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Your Bid</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Proposal Text */}
                            <div>
                                <label className="label">Proposal Summary *</label>
                                <textarea
                                    name="proposalText"
                                    value={bidData.proposalText}
                                    onChange={handleChange}
                                    rows={6}
                                    className="input-field"
                                    placeholder="Provide a comprehensive overview of your proposal..."
                                    required
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    This will be analyzed by AI to extract key information
                                </p>
                            </div>

                            {/* Technical Approach */}
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

                            {/* Financial & Timeline */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Proposed Cost</label>
                                    <input
                                        type="text"
                                        name="proposedCost"
                                        value={bidData.proposedCost}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="e.g., $50,000"
                                    />
                                </div>

                                <div>
                                    <label className="label">Timeline</label>
                                    <input
                                        type="text"
                                        name="timeline"
                                        value={bidData.timeline}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="e.g., 6 months"
                                    />
                                </div>
                            </div>

                            {/* Team & Experience */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Team Size</label>
                                    <input
                                        type="text"
                                        name="teamSize"
                                        value={bidData.teamSize}
                                        onChange={handleChange}
                                        className="input-field"
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
                                        className="input-field"
                                        placeholder="e.g., 8 years"
                                    />
                                </div>
                            </div>

                            {/* Certifications */}
                            <div>
                                <label className="label">Certifications</label>
                                <input
                                    type="text"
                                    name="certifications"
                                    value={bidData.certifications}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="e.g., ISO9001, ISO27001"
                                />
                            </div>

                            {/* AI Analysis Button */}
                            <div className="border-t pt-6">
                                <button
                                    type="button"
                                    onClick={handleAnalyze}
                                    disabled={analyzing || !bidData.proposalText}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {analyzing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Analyzing with AI...
                                        </span>
                                    ) : (
                                        '🤖 Analyze with AI'
                                    )}
                                </button>
                            </div>

                            {/* AI Analysis Results */}
                            {aiAnalysis && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis Results</h3>

                                    <div className="space-y-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h4 className="font-semibold text-blue-900 mb-2">Summary</h4>
                                            <p className="text-blue-800 text-sm">{aiAnalysis.summary}</p>
                                        </div>

                                        {aiAnalysis.keyFeatures && aiAnalysis.keyFeatures.length > 0 && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <h4 className="font-semibold text-green-900 mb-2">Key Features</h4>
                                                <ul className="list-disc list-inside text-green-800 text-sm space-y-1">
                                                    {aiAnalysis.keyFeatures.map((feature, idx) => (
                                                        <li key={idx}>{feature}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {aiAnalysis.strengths && aiAnalysis.strengths.length > 0 && (
                                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                                <h4 className="font-semibold text-purple-900 mb-2">Strengths</h4>
                                                <ul className="list-disc list-inside text-purple-800 text-sm space-y-1">
                                                    {aiAnalysis.strengths.map((strength, idx) => (
                                                        <li key={idx}>{strength}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Compliance Check */}
                            {complianceCheck && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Check</h3>

                                    <div className={`border rounded-lg p-4 ${complianceCheck.passed ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-2xl ${complianceCheck.passed ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {complianceCheck.passed ? '✅' : '⚠️'}
                                            </span>
                                            <span className={`font-semibold ${complianceCheck.passed ? 'text-green-900' : 'text-yellow-900'}`}>
                                                {complianceCheck.passed ? 'Compliance Check Passed' : 'Compliance Issues Found'}
                                            </span>
                                            <span className={`ml-auto text-sm font-semibold ${complianceCheck.passed ? 'text-green-700' : 'text-yellow-700'}`}>
                                                Score: {complianceCheck.score}/100
                                            </span>
                                        </div>

                                        {complianceCheck.issues && complianceCheck.issues.length > 0 && (
                                            <div className="mt-3">
                                                <p className="text-sm font-semibold text-yellow-900 mb-1">Issues:</p>
                                                <ul className="list-disc list-inside text-yellow-800 text-sm space-y-1">
                                                    {complianceCheck.issues.map((issue, idx) => (
                                                        <li key={idx}>{issue}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {complianceCheck.recommendations && (
                                            <div className="mt-3">
                                                <p className="text-sm font-semibold text-gray-700 mb-1">Recommendations:</p>
                                                <p className="text-sm text-gray-600">{complianceCheck.recommendations}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => navigate('/vendor/dashboard')}
                                    className="btn-secondary flex-1"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary flex-1"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Bid'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SubmitBid;
