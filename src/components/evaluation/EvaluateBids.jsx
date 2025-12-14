// Bid Evaluation Component
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTenderById, getBidsByTender, createEvaluation } from '../../services/firebaseService';
import { generateEvaluationRecommendations } from '../../services/geminiService';
import Navbar from '../layout/Navbar';
import LoadingSpinner from '../shared/LoadingSpinner';

const EvaluateBids = () => {
    const { tenderId } = useParams();
    const { userProfile } = useAuth();
    const navigate = useNavigate();

    const [tender, setTender] = useState(null);
    const [bids, setBids] = useState([]);
    const [selectedBid, setSelectedBid] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [scores, setScores] = useState({});
    const [comments, setComments] = useState('');
    const [recommendation, setRecommendation] = useState('APPROVE');
    const [aiRecommendation, setAiRecommendation] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tenderData, bidsData] = await Promise.all([
                    getTenderById(tenderId),
                    getBidsByTender(tenderId)
                ]);

                setTender(tenderData);
                setBids(bidsData);

                if (bidsData.length > 0) {
                    setSelectedBid(bidsData[0]);
                    // Initialize scores
                    const initialScores = {};
                    tenderData.criteria.forEach(criterion => {
                        initialScores[criterion.name] = 0;
                    });
                    setScores(initialScores);
                }
            } catch (err) {
                setError('Failed to load data: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tenderId]);

    const handleBidSelect = (bid) => {
        setSelectedBid(bid);
        setAiRecommendation(null);
        // Reset scores
        const initialScores = {};
        tender.criteria.forEach(criterion => {
            initialScores[criterion.name] = 0;
        });
        setScores(initialScores);
        setComments('');
    };

    const handleScoreChange = (criterionName, value) => {
        setScores({ ...scores, [criterionName]: parseInt(value) || 0 });
    };

    const calculateTotalScore = () => {
        return Object.values(scores).reduce((sum, score) => sum + score, 0);
    };

    const getAiRecommendation = async () => {
        if (!selectedBid) return;

        setLoadingRecommendations(true);
        setError('');

        try {
            const recommendations = await generateEvaluationRecommendations(
                selectedBid.bidData,
                tender.criteria
            );
            setAiRecommendation(recommendations);

            // Optionally pre-fill scores with AI recommendations
            if (recommendations.scores) {
                setScores(recommendations.scores);
            }
        } catch (err) {
            setError('Failed to get AI recommendations: ' + err.message);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    const handleSubmitEvaluation = async () => {
        setError('');
        setSubmitting(true);

        try {
            const evaluation = {
                bidId: selectedBid.id,
                tenderId: tender.id,
                evaluatorId: userProfile.uid,
                evaluatorName: userProfile.displayName,
                scores: scores,
                totalScore: calculateTotalScore(),
                comments: comments,
                recommendation: recommendation,
                aiRecommendation: aiRecommendation
            };

            await createEvaluation(evaluation);

            // Update bid status based on recommendation
            const { updateBid, updateTender } = await import('../../services/firebaseService');
            const newStatus = recommendation === 'APPROVE' ? 'APPROVED' :
                recommendation === 'REJECT' ? 'REJECTED' : 'UNDER_REVIEW';

            await updateBid(selectedBid.id, {
                status: newStatus,
                evaluationId: evaluation.bidId,
                evaluatedAt: new Date(),
                evaluatorName: userProfile.displayName
            });

            // If bid is approved, close the tender
            if (recommendation === 'APPROVE') {
                await updateTender(tender.id, {
                    status: 'COMPLETED',
                    winningBidId: selectedBid.id,
                    completedAt: new Date()
                });
            }

            // Move to next bid or go back to dashboard
            const currentIndex = bids.findIndex(b => b.id === selectedBid.id);
            if (currentIndex < bids.length - 1) {
                handleBidSelect(bids[currentIndex + 1]);
            } else {
                navigate('/evaluator/dashboard');
            }
        } catch (err) {
            setError('Failed to submit evaluation: ' + err.message);
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

    if (!tender || bids.length === 0) return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">No Bids to Evaluate</h2>
                    <p className="mt-2 text-gray-600">There are no bids submitted for this tender yet.</p>
                    <button onClick={() => navigate('/evaluator/dashboard')} className="mt-4 btn-primary">
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Tender Info */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{tender.title}</h1>
                        <p className="text-gray-600">{tender.description}</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Bid List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-4">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">
                                    Bids ({bids.length})
                                </h2>
                                <div className="space-y-2">
                                    {bids.map((bid) => (
                                        <button
                                            key={bid.id}
                                            onClick={() => handleBidSelect(bid)}
                                            className={`w-full text-left p-3 rounded-lg border ${selectedBid?.id === bid.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="font-semibold text-sm">{bid.companyName || 'Unknown Company'}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {bid.vendorName} • {new Date(bid.submittedAt?.seconds * 1000).toLocaleDateString()}
                                            </div>
                                            {bid.complianceCheck && (
                                                <div className="mt-2">
                                                    <span className={`text-xs px-2 py-1 rounded ${bid.complianceCheck.passed
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        Compliance: {bid.complianceCheck.score}/100
                                                    </span>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Evaluation Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Evaluate: {selectedBid?.companyName}
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Submitted by {selectedBid?.vendorName}
                                        </p>
                                    </div>
                                    <button
                                        onClick={getAiRecommendation}
                                        disabled={loadingRecommendations}
                                        className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
                                    >
                                        {loadingRecommendations ? 'Loading...' : '🤖 AI Recommend'}
                                    </button>
                                </div>

                                {/* Bid Details */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">Proposal Summary</h3>
                                    <p className="text-sm text-gray-700 mb-3">{selectedBid?.bidData?.proposalText}</p>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        {selectedBid?.bidData?.proposedCost && (
                                            <div>
                                                <span className="text-gray-500">Cost:</span>
                                                <span className="ml-2 font-semibold">{selectedBid.bidData.proposedCost}</span>
                                            </div>
                                        )}
                                        {selectedBid?.bidData?.timeline && (
                                            <div>
                                                <span className="text-gray-500">Timeline:</span>
                                                <span className="ml-2 font-semibold">{selectedBid.bidData.timeline}</span>
                                            </div>
                                        )}
                                        {selectedBid?.bidData?.experience && (
                                            <div>
                                                <span className="text-gray-500">Experience:</span>
                                                <span className="ml-2 font-semibold">{selectedBid.bidData.experience}</span>
                                            </div>
                                        )}
                                        {selectedBid?.bidData?.teamSize && (
                                            <div>
                                                <span className="text-gray-500">Team Size:</span>
                                                <span className="ml-2 font-semibold">{selectedBid.bidData.teamSize}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* AI Analysis Results */}
                                {selectedBid?.aiAnalysis && (
                                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h3 className="font-semibold text-blue-900 mb-2">AI Analysis</h3>
                                        <p className="text-sm text-blue-800">{selectedBid.aiAnalysis.summary}</p>
                                    </div>
                                )}

                                {/* AI Recommendations */}
                                {aiRecommendation && (
                                    <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                        <h3 className="font-semibold text-purple-900 mb-3">AI Evaluation Recommendations</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-purple-800">Total Score:</span>
                                                <span className="font-bold text-purple-900">{aiRecommendation.totalScore}/100</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-purple-800">Confidence:</span>
                                                <span className="font-semibold text-purple-900">
                                                    {(aiRecommendation.confidence * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-purple-800">Recommendation:</span>
                                                <span className={`font-semibold ${aiRecommendation.overall_recommendation === 'APPROVE' ? 'text-green-700' :
                                                    aiRecommendation.overall_recommendation === 'REJECT' ? 'text-red-700' :
                                                        'text-yellow-700'
                                                    }`}>
                                                    {aiRecommendation.overall_recommendation}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Scoring */}
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Evaluation Scores</h3>
                                    <div className="space-y-4">
                                        {tender.criteria.map((criterion) => (
                                            <div key={criterion.name} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{criterion.name}</div>
                                                        <div className="text-sm text-gray-500">{criterion.description}</div>
                                                    </div>
                                                    <div className="text-sm text-gray-500">Max: {criterion.weight}</div>
                                                </div>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max={criterion.weight}
                                                        value={scores[criterion.name] || 0}
                                                        onChange={(e) => handleScoreChange(criterion.name, e.target.value)}
                                                        className="flex-1"
                                                    />
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={criterion.weight}
                                                        value={scores[criterion.name] || 0}
                                                        onChange={(e) => handleScoreChange(criterion.name, e.target.value)}
                                                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                                {aiRecommendation?.reasoning?.[criterion.name] && (
                                                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                                        AI: {aiRecommendation.reasoning[criterion.name]}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total Score:</span>
                                            <span className="text-blue-600">{calculateTotalScore()}/100</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments */}
                                <div className="mb-6">
                                    <label className="label">Evaluator Comments</label>
                                    <textarea
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        rows={4}
                                        className="input-field"
                                        placeholder="Add your detailed feedback and observations..."
                                    />
                                </div>

                                {/* Recommendation */}
                                <div className="mb-6">
                                    <label className="label">Final Recommendation</label>
                                    <select
                                        value={recommendation}
                                        onChange={(e) => setRecommendation(e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="APPROVE">Approve</option>
                                        <option value="REJECT">Reject</option>
                                        <option value="REQUEST_CLARIFICATION">Request Clarification</option>
                                    </select>
                                </div>

                                {/* Submit Button */}
                                <button
                                    onClick={handleSubmitEvaluation}
                                    disabled={submitting}
                                    className="w-full btn-primary"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Evaluation'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EvaluateBids;
