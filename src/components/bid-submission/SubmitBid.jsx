// Bid Submission Form Component
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
            // Re-fetch tender to check current status before submitting
            const currentTender = await getTenderById(tenderId);

            if (!currentTender) {
                setError('Tender not found');
                setSubmitting(false);
                return;
            }

            if (currentTender.status === 'COMPLETED' || currentTender.status === 'CLOSED') {
                setError('This tender has been closed and is no longer accepting bids.');
                setSubmitting(false);
                setTender(null); // Clear tender to show error state
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
            <LoadingSpinner />
        </>
    );

    if (error && !tender) return (
        <>
            <Navbar />
            <div className="page-brutal flex items-center justify-center">
                <div className="card text-center max-w-2xl">
                    <h2 className="text-3xl font-black text-google-red mb-4 uppercase">Tender Unavailable</h2>
                    <p className="text-black font-bold mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/vendor/dashboard')}
                        className="btn-primary"
                    >
                        BACK TO DASHBOARD
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <>
            <Navbar />
            <div className="page-brutal">
                <div className="container-brutal max-w-5xl">
                    {/* Tender Info */}
                    <div className="card mb-8">
                        <h1 className="text-3xl font-black text-black mb-3 uppercase">{tender.title}</h1>
                        <p className="text-black font-semibold mb-4">{tender.description}</p>
                        <div className="flex gap-6">
                            <span className="font-bold text-black">
                                Deadline: {new Date(tender.deadline?.seconds * 1000).toLocaleDateString()}
                            </span>
                            <span className="badge-green">OPEN</span>
                        </div>
                    </div>

                    {error && (
                        <div className="alert-error mb-8">
                            {error}
                        </div>
                    )}

                    {/* Bid Form */}
                    <div className="card">
                        <h2 className="text-3xl font-black text-black mb-8 uppercase">Submit Your Bid</h2>

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
                                <p className="mt-2 text-sm font-semibold text-black">
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
                            <div className="divider"></div>
                            <button
                                type="button"
                                onClick={handleAnalyze}
                                disabled={analyzing || !bidData.proposalText}
                                className="w-full btn-warning disabled:opacity-50"
                            >
                                {analyzing ? '🤖 ANALYZING WITH AI...' : '🤖 ANALYZE WITH AI'}
                            </button>

                            {/* AI Analysis Results */}
                            {aiAnalysis && (
                                <div className="border-4 border-black p-6 bg-google-blue text-white">
                                    <h3 className="text-2xl font-black mb-4 uppercase">AI Analysis Results</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-black mb-2">Summary</h4>
                                            <p className="font-semibold">{aiAnalysis.summary}</p>
                                        </div>

                                        {aiAnalysis.keyFeatures && aiAnalysis.keyFeatures.length > 0 && (
                                            <div>
                                                <h4 className="font-black mb-2">Key Features</h4>
                                                <ul className="list-disc list-inside font-semibold space-y-1">
                                                    {aiAnalysis.keyFeatures.map((feature, idx) => (
                                                        <li key={idx}>{feature}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {aiAnalysis.strengths && aiAnalysis.strengths.length > 0 && (
                                            <div>
                                                <h4 className="font-black mb-2">Strengths</h4>
                                                <ul className="list-disc list-inside font-semibold space-y-1">
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
                                <div className={`border-4 border-black p-6 ${complianceCheck.passed ? 'bg-google-green text-white' : 'bg-google-yellow text-black'
                                    }`}>
                                    <h3 className="text-2xl font-black mb-4 uppercase">Compliance Check</h3>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-4xl">
                                            {complianceCheck.passed ? '✅' : '⚠️'}
                                        </span>
                                        <span className="font-black text-xl">
                                            {complianceCheck.passed ? 'COMPLIANCE CHECK PASSED' : 'COMPLIANCE ISSUES FOUND'}
                                        </span>
                                        <span className="ml-auto text-xl font-black">
                                            Score: {complianceCheck.score}/100
                                        </span>
                                    </div>

                                    {complianceCheck.issues && complianceCheck.issues.length > 0 && (
                                        <div>
                                            <p className="font-black mb-2">Issues:</p>
                                            <ul className="list-disc list-inside font-semibold space-y-1">
                                                {complianceCheck.issues.map((issue, idx) => (
                                                    <li key={idx}>{issue}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {complianceCheck.recommendations && (
                                        <div className="mt-4">
                                            <p className="font-black mb-2">Recommendations:</p>
                                            <p className="font-semibold">{complianceCheck.recommendations}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Submit Buttons */}
                            <div className="divider"></div>
                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => navigate('/vendor/dashboard')}
                                    className="btn-secondary flex-1"
                                    disabled={submitting}
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary flex-1"
                                    disabled={submitting}
                                >
                                    {submitting ? 'SUBMITTING...' : 'SUBMIT BID'}
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
