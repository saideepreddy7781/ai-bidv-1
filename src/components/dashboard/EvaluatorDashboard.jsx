// Evaluator Dashboard - Neobrutalism Style
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
            <div className="page-brutal">
                <div className="container-brutal">
                    <div className="card mb-8">
                        <h1 className="text-4xl font-black text-black mb-2 uppercase tracking-tight">
                            Evaluator Dashboard
                        </h1>
                        <p className="text-black font-bold">Review and evaluate bid submissions with AI-powered insights</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="stat-card-blue">
                            <p className="text-sm font-bold mb-2 uppercase">Total Tenders</p>
                            <p className="text-5xl font-black">{tenders.length}</p>
                        </div>
                        <div className="stat-card-green">
                            <p className="text-sm font-bold mb-2 uppercase">My Evaluations</p>
                            <p className="text-5xl font-black">{myEvaluations.length}</p>
                        </div>
                        <div className="stat-card-green">
                            <p className="text-sm font-bold mb-2 uppercase">Approved</p>
                            <p className="text-5xl font-black">
                                {myEvaluations.filter(e => e.recommendation === 'APPROVE').length}
                            </p>
                        </div>
                        <div className="stat-card-red">
                            <p className="text-sm font-bold mb-2 uppercase">Rejected</p>
                            <p className="text-5xl font-black">
                                {myEvaluations.filter(e => e.recommendation === 'REJECT').length}
                            </p>
                        </div>
                    </div>

                    {/* My Evaluations Section */}
                    {myEvaluations.length > 0 && (
                        <div className="card mb-8">
                            <h2 className="text-3xl font-black text-black mb-6 uppercase">My Recent Evaluations</h2>
                            <div className="space-y-4">
                                {myEvaluations.slice(0, 5).map((evaluation) => (
                                    <div key={evaluation.id} className="border-4 border-black p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-black text-xl text-black">{evaluation.tender?.title}</h3>
                                                <p className="text-black font-semibold mt-2">
                                                    Bid by: {evaluation.bid?.companyName || evaluation.bid?.vendorName || 'Unknown'}
                                                </p>
                                            </div>
                                            <span className={`px-4 py-2 border-4 border-black font-bold uppercase ${evaluation.recommendation === 'APPROVE' ? 'bg-google-green text-white' :
                                                evaluation.recommendation === 'REJECT' ? 'bg-google-red text-white' :
                                                    'bg-google-yellow text-black'
                                                }`}>
                                                {evaluation.recommendation}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <div className="font-bold text-black">
                                                Total Score: <span className="text-google-blue">{evaluation.totalScore}/100</span>
                                            </div>
                                            <div className="font-bold text-black">
                                                Evaluated: {new Date(evaluation.evaluatedAt?.seconds * 1000).toLocaleDateString()}
                                            </div>
                                        </div>
                                        {evaluation.comments && (
                                            <div className="mt-4 p-4 bg-gray-100 border-4 border-black">
                                                <p className="font-semibold text-black">{evaluation.comments}</p>
                                                <div className="mt-4 flex justify-end">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const res = await import('../../services/pdfService').then(m => m.generateAndSavePDF(evaluation));
                                                                if (res.success) alert('Report saved to database!');
                                                                else alert('Failed to save report: ' + res.error);
                                                            } catch (e) {
                                                                alert('Error generating report');
                                                                console.error(e);
                                                            }
                                                        }}
                                                        className="btn-success text-sm py-1 px-3"
                                                    >
                                                        GENERATE & SAVE REPORT
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tenders to Evaluate */}
                    <div className="card">
                        <h2 className="text-3xl font-black text-black mb-6 uppercase">Tenders to Evaluate</h2>

                        {tenders.length === 0 ? (
                            <p className="text-black font-bold text-center py-8">No tenders available for evaluation</p>
                        ) : (
                            <div className="space-y-4">
                                {tenders.map((tender) => (
                                    <div key={tender.id} className="border-4 border-black p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-black text-2xl text-black">{tender.title}</h3>
                                            <span className={`px-4 py-2 border-4 border-black font-bold uppercase ${tender.status === 'OPEN' ? 'bg-google-green text-white' :
                                                tender.status === 'EVALUATING' ? 'bg-google-yellow text-black' :
                                                    tender.status === 'CLOSED' ? 'bg-gray-400 text-white' :
                                                        'bg-google-blue text-white'
                                                }`}>
                                                {tender.status}
                                            </span>
                                        </div>
                                        <p className="text-black font-semibold mb-4 line-clamp-2">{tender.description}</p>
                                        <div className="flex justify-between items-center">
                                            <div className="font-bold text-black">
                                                Deadline: {new Date(tender.deadline?.seconds * 1000).toLocaleDateString()}
                                            </div>
                                            <Link
                                                to={`/evaluator/evaluate/${tender.id}`}
                                                className="btn-primary"
                                            >
                                                EVALUATE BIDS
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
