// Evaluator Dashboard - Professional Style
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

    const getStatusBadge = (status) => {
        const styles = {
            'OPEN': 'bg-green-100 text-green-800 border-green-200',
            'EVALUATING': 'bg-amber-100 text-amber-800 border-amber-200',
            'CLOSED': 'bg-gray-100 text-gray-800 border-gray-200',
            'COMPLETED': 'bg-blue-100 text-blue-800 border-blue-200'
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles['CLOSED']}`}>
                {status}
            </span>
        );
    };

    const getRecommendationBadge = (rec) => {
        const styles = {
            'APPROVE': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'REJECT': 'bg-red-100 text-red-800 border-red-200',
        };
        const defaultStyle = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[rec] || defaultStyle}`}>
                {rec || 'PENDING'}
            </span>
        );
    };

    if (loading) return (
        <>
            <Navbar />
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                <LoadingSpinner />
            </div>
        </>
    );

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            Evaluator Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Review and evaluate bid submissions with AI-powered insights
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="card bg-white p-6 shadow-sm rounded-xl border border-slate-200">
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Tenders</p>
                            <p className="mt-2 text-3xl font-semibold text-slate-900">{tenders.length}</p>
                        </div>
                        <div className="card bg-white p-6 shadow-sm rounded-xl border border-slate-200">
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">My Evaluations</p>
                            <p className="mt-2 text-3xl font-semibold text-slate-900">{myEvaluations.length}</p>
                        </div>
                        <div className="card bg-white p-6 shadow-sm rounded-xl border border-slate-200">
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Approved</p>
                            <p className="mt-2 text-3xl font-semibold text-emerald-600">
                                {myEvaluations.filter(e => e.recommendation === 'APPROVE').length}
                            </p>
                        </div>
                        <div className="card bg-white p-6 shadow-sm rounded-xl border border-slate-200">
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Rejected</p>
                            <p className="mt-2 text-3xl font-semibold text-red-600">
                                {myEvaluations.filter(e => e.recommendation === 'REJECT').length}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Tenders to Evaluate */}
                        <div className="card h-full bg-white shadow-sm rounded-xl border border-slate-200 flex flex-col">
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-lg font-bold text-slate-900">Tenders to Evaluate</h2>
                            </div>

                            {tenders.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    No tenders available for evaluation
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {tenders.map((tender) => (
                                        <div key={tender.id} className="p-6 hover:bg-slate-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-base font-semibold text-slate-900">{tender.title}</h3>
                                                {getStatusBadge(tender.status)}
                                            </div>
                                            <p className="text-sm text-slate-600 mb-4 line-clamp-2">{tender.description}</p>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Deadline: {new Date(tender.deadline?.seconds * 1000).toLocaleDateString()}
                                                </div>
                                                <Link
                                                    to={`/evaluator/evaluate/${tender.id}`}
                                                    className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
                                                >
                                                    Evaluate Bids &rarr;
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Evaluations */}
                        <div className="card h-full bg-white shadow-sm rounded-xl border border-slate-200 flex flex-col">
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-lg font-bold text-slate-900">My Recent Evaluations</h2>
                            </div>

                            {myEvaluations.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {myEvaluations.slice(0, 5).map((evaluation) => (
                                        <div key={evaluation.id} className="p-6 hover:bg-slate-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-slate-900">{evaluation.tender?.title}</h3>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Bid by: <span className="font-medium text-slate-700">{evaluation.bid?.companyName || evaluation.bid?.vendorName || 'Unknown'}</span>
                                                    </p>
                                                </div>
                                                {getRecommendationBadge(evaluation.recommendation)}
                                            </div>

                                            <div className="mt-3 grid grid-cols-2 gap-4">
                                                <div className="text-sm">
                                                    <span className="text-slate-500">Score: </span>
                                                    <span className="font-bold text-slate-900">{evaluation.totalScore}/100</span>
                                                </div>
                                                <div className="text-sm text-right">
                                                    <span className="text-slate-500">Date: </span>
                                                    <span className="text-slate-900">{new Date(evaluation.evaluatedAt?.seconds * 1000).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {evaluation.comments && (
                                                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                    <p className="text-xs text-slate-600 italic">"{evaluation.comments}"</p>
                                                    <div className="mt-2 flex justify-end">
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
                                                            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                                        >
                                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            Save Report
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-500">
                                    No evaluations completed yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EvaluatorDashboard;
