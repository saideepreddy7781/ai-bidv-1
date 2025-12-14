// Evaluator Dashboard
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllTenders, getEvaluationsByTender, getBidById } from '../../services/firebaseService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../shared/LoadingSpinner';
import Navbar from '../layout/Navbar';

const EvaluatorDashboard = () => {
    const { userProfile } = useAuth();
    const [tenders, setTenders] = useState([]);
    const [myEvaluations, setMyEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tendersData = await getAllTenders();
                const activeTenders = tendersData.filter(t => t.status !== 'DRAFT');
                setTenders(activeTenders);

                // Fetch my evaluations
                const evaluationsPromises = activeTenders.map(async (tender) => {
                    const tenderEvaluations = await getEvaluationsByTender(tender.id);
                    // Filter for my evaluations
                    const myTenderEvals = tenderEvaluations.filter(
                        evaluation => evaluation.evaluatorId === userProfile.uid
                    );

                    // Get bid details for each evaluation
                    return Promise.all(myTenderEvals.map(async (evaluation) => {
                        const bid = await getBidById(evaluation.bidId);
                        return {
                            ...evaluation,
                            tender: tender,
                            bid: bid
                        };
                    }));
                });

                const allEvaluations = await Promise.all(evaluationsPromises);
                const flatEvaluations = allEvaluations.flat();
                setMyEvaluations(flatEvaluations);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userProfile?.uid) {
            fetchData();
        }
    }, [userProfile]);

    if (loading) return (
        <>
            <Navbar />
            <LoadingSpinner />
        </>
    );

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Evaluator Dashboard
                        </h1>
                        <p className="text-gray-600">Review and evaluate bid submissions with AI-powered insights</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-gray-500 text-sm">Total Tenders</p>
                            <p className="text-3xl font-bold text-blue-600">{tenders.length}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-gray-500 text-sm">My Evaluations</p>
                            <p className="text-3xl font-bold text-green-600">{myEvaluations.length}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-gray-500 text-sm">Approved</p>
                            <p className="text-3xl font-bold text-green-600">
                                {myEvaluations.filter(e => e.recommendation === 'APPROVE').length}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-gray-500 text-sm">Rejected</p>
                            <p className="text-3xl font-bold text-red-600">
                                {myEvaluations.filter(e => e.recommendation === 'REJECT').length}
                            </p>
                        </div>
                    </div>

                    {/* My Evaluations Section */}
                    {myEvaluations.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Recent Evaluations</h2>
                            <div className="space-y-4">
                                {myEvaluations.slice(0, 5).map((evaluation) => (
                                    <div key={evaluation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{evaluation.tender?.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Bid by: {evaluation.bid?.companyName || evaluation.bid?.vendorName || 'Unknown'}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded text-sm font-semibold ${evaluation.recommendation === 'APPROVE' ? 'bg-green-100 text-green-800' :
                                                evaluation.recommendation === 'REJECT' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {evaluation.recommendation}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                                            <div>
                                                <span className="text-gray-500">Total Score:</span>
                                                <span className="ml-2 font-semibold text-blue-600">{evaluation.totalScore}/100</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Evaluated:</span>
                                                <span className="ml-2">{new Date(evaluation.evaluatedAt?.seconds * 1000).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        {evaluation.comments && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-700">{evaluation.comments}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tenders to Evaluate */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tenders to Evaluate</h2>

                        {tenders.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No tenders available for evaluation</p>
                        ) : (
                            <div className="space-y-4">
                                {tenders.map((tender) => (
                                    <div key={tender.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-lg text-gray-900">{tender.title}</h3>
                                            <span className={`px-3 py-1 rounded text-sm ${tender.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                                                tender.status === 'EVALUATING' ? 'bg-yellow-100 text-yellow-800' :
                                                    tender.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {tender.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tender.description}</p>
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-gray-500">
                                                Deadline: {new Date(tender.deadline?.seconds * 1000).toLocaleDateString()}
                                            </div>
                                            <Link
                                                to={`/evaluator/evaluate/${tender.id}`}
                                                className="btn-primary text-sm"
                                            >
                                                Evaluate Bids
                                            </Link>
                                        </div>
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

export default EvaluatorDashboard;
