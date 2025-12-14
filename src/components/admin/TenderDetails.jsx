// Tender Details Component
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTenderById, getBidsByTender } from '../../services/firebaseService';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../layout/Navbar';
import LoadingSpinner from '../shared/LoadingSpinner';

const TenderDetails = () => {
    const { tenderId } = useParams();
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const [tender, setTender] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tenderData, bidsData] = await Promise.all([
                    getTenderById(tenderId),
                    getBidsByTender(tenderId)
                ]);

                if (!tenderData) {
                    setError('Tender not found');
                } else {
                    setTender(tenderData);
                    setBids(bidsData);
                }
            } catch (err) {
                setError('Failed to load tender details: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tenderId]);

    if (loading) return (
        <>
            <Navbar />
            <LoadingSpinner />
        </>
    );

    if (error || !tender) return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600">Error</h2>
                    <p className="mt-2 text-gray-600">{error || 'Tender not found'}</p>
                    <button onClick={() => navigate(-1)} className="mt-4 btn-primary">
                        Go Back
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
                    {/* Header */}
                    <div className="mb-6 flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="btn-secondary">
                            ← Back
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Tender Details</h1>
                    </div>

                    {/* Tender Info */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{tender.title}</h2>
                                <p className="text-gray-600">{tender.description}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${tender.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                                    tender.status === 'EVALUATING' ? 'bg-yellow-100 text-yellow-800' :
                                        tender.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                                            'bg-blue-100 text-blue-800'
                                }`}>
                                {tender.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Deadline</h3>
                                <p className="text-gray-600">
                                    {new Date(tender.deadline?.seconds * 1000).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Created By</h3>
                                <p className="text-gray-600">{tender.createdBy}</p>
                            </div>
                        </div>

                        {/* Requirements */}
                        {tender.requirements && (
                            <div className="mt-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    {tender.requirements.minExperience && (
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold">Minimum Experience:</span> {tender.requirements.minExperience} years
                                        </p>
                                    )}
                                    {tender.requirements.requiredCertifications && tender.requirements.requiredCertifications.length > 0 && (
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold">Required Certifications:</span> {tender.requirements.requiredCertifications.join(', ')}
                                        </p>
                                    )}
                                    {tender.requirements.otherRequirements && (
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold">Other:</span> {tender.requirements.otherRequirements}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Evaluation Criteria */}
                        {tender.criteria && tender.criteria.length > 0 && (
                            <div className="mt-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Evaluation Criteria</h3>
                                <div className="space-y-3">
                                    {tender.criteria.map((criterion, idx) => (
                                        <div key={idx} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-gray-900">{criterion.name}</h4>
                                                <span className="text-sm font-semibold text-blue-600">{criterion.weight}%</span>
                                            </div>
                                            {criterion.description && (
                                                <p className="text-sm text-gray-600">{criterion.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bids Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Submitted Bids ({bids.length})</h2>
                            {userProfile?.role === 'EVALUATOR' && bids.length > 0 && (
                                <Link
                                    to={`/evaluator/evaluate/${tender.id}`}
                                    className="btn-primary"
                                >
                                    Evaluate Bids
                                </Link>
                            )}
                        </div>

                        {bids.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No bids submitted yet</p>
                        ) : (
                            <div className="space-y-4">
                                {bids.map((bid) => (
                                    <div key={bid.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{bid.companyName || 'Unknown Company'}</h3>
                                                <p className="text-sm text-gray-500">Submitted by: {bid.vendorName}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded text-sm ${bid.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                                                    bid.status === 'EVALUATED' ? 'bg-purple-100 text-purple-800' :
                                                        bid.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                }`}>
                                                {bid.status}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-500 mb-3">
                                            Submitted: {new Date(bid.submittedAt?.seconds * 1000).toLocaleString()}
                                        </p>

                                        {bid.complianceCheck && (
                                            <div className={`mt-3 p-3 rounded-lg ${bid.complianceCheck.passed ? 'bg-green-50' : 'bg-yellow-50'
                                                }`}>
                                                <p className="text-sm font-semibold">
                                                    {bid.complianceCheck.passed ? '✅' : '⚠️'} Compliance Score: {bid.complianceCheck.score}/100
                                                </p>
                                            </div>
                                        )}

                                        {bid.aiAnalysis?.summary && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">AI Summary:</span> {bid.aiAnalysis.summary.slice(0, 150)}...
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default TenderDetails;
