// Tender Details Component
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTenderById, getBidsByTender, acceptBid } from '../../services/firebaseService';
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
    const [processingId, setProcessingId] = useState(null);

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

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenderId]);

    const handleAcceptBid = async (bid) => {
        if (!window.confirm(`Are you sure you want to ACCEPT the bid from ${bid.companyName}? This will close the tender for all other vendors.`)) {
            return;
        }

        setProcessingId(bid.id);
        try {
            await acceptBid(
                bid.id,
                tender.id,
                userProfile.uid,
                userProfile.displayName || 'Procurement Officer',
                'Bid accepted by Procurement Officer'
            );
            alert('Bid accepted successfully! The tender is now closed.');
            await fetchData(); // Refresh data
        } catch (err) {
            console.error(err);
            alert('Failed to accept bid: ' + err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'OPEN': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'EVALUATING': 'bg-amber-100 text-amber-800 border-amber-200',
            'CLOSED': 'bg-slate-100 text-slate-800 border-slate-200',
            'COMPLETED': 'bg-blue-100 text-blue-800 border-blue-200'
        };
        const defaultStyle = 'bg-gray-100 text-gray-800 border-gray-200';

        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || defaultStyle}`}>
                {status}
            </span>
        );
    };

    const getBidStatusBadge = (status) => {
        const styles = {
            'SUBMITTED': 'bg-blue-100 text-blue-800 border-blue-200',
            'EVALUATED': 'bg-purple-100 text-purple-800 border-purple-200',
            'APPROVED': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'REJECTED': 'bg-red-100 text-red-800 border-red-200'
        };
        const defaultStyle = 'bg-gray-100 text-gray-800 border-gray-200';

        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || defaultStyle}`}>
                {status}
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

    if (error || !tender) return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border border-slate-200">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-medium text-slate-900">Error</h2>
                    <p className="mt-2 text-slate-500">{error || 'Tender not found'}</p>
                    <button onClick={() => navigate(-1)} className="mt-6 btn-primary w-full">
                        Go Back
                    </button>
                </div>
            </div>
        </>
    );

    const canManageTender = ['PROCUREMENT_OFFICER', 'ADMIN'].includes(userProfile?.role);
    const isTenderActive = tender.status === 'OPEN' || tender.status === 'EVALUATING';

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <nav className="flex mb-4" aria-label="Breadcrumb">
                            <ol role="list" className="flex items-center space-x-4">
                                <li>
                                    <div>
                                        <Link to="/procurement/dashboard" className="text-slate-400 hover:text-slate-500">
                                            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
                                            </svg>
                                            <span className="sr-only">Home</span>
                                        </Link>
                                    </div>
                                </li>
                                <li>
                                    <div className="flex items-center">
                                        <svg className="h-5 w-5 flex-shrink-0 text-slate-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                                        </svg>
                                        <span className="ml-4 text-sm font-medium text-slate-500">Tender Details</span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                        <div className="md:flex md:items-center md:justify-between">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                                    {tender.title}
                                </h2>
                            </div>
                            <div className="mt-4 flex md:ml-4 md:mt-0">
                                {getStatusBadge(tender.status)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Tender Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="card">
                                <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">Description</h3>
                                <div className="prose prose-slate max-w-none text-slate-500">
                                    <p>{tender.description}</p>
                                </div>

                                <div className="mt-6 border-t border-slate-100 pt-6">
                                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                        <div>
                                            <dt className="text-sm font-medium text-slate-500">Created By</dt>
                                            <dd className="mt-1 text-sm text-slate-900">{tender.createdBy}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-slate-500">Deadline</dt>
                                            <dd className="mt-1 text-sm text-slate-900">{new Date(tender.deadline?.seconds * 1000).toLocaleString()}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {/* Requirements */}
                            {tender.requirements && (
                                <div className="card">
                                    <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">Requirements</h3>
                                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                        {tender.requirements.minExperience && (
                                            <div className="sm:col-span-1">
                                                <dt className="text-sm font-medium text-slate-500">Minimum Experience</dt>
                                                <dd className="mt-1 text-sm text-slate-900">{tender.requirements.minExperience} years</dd>
                                            </div>
                                        )}
                                        {tender.requirements.requiredCertifications && tender.requirements.requiredCertifications.length > 0 && (
                                            <div className="sm:col-span-2">
                                                <dt className="text-sm font-medium text-slate-500">Required Certifications</dt>
                                                <dd className="mt-1 text-sm text-slate-900">
                                                    <div className="flex flex-wrap gap-2">
                                                        {tender.requirements.requiredCertifications.map((cert, index) => (
                                                            <span key={index} className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                                                {cert}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Bids */}
                        <div className="lg:col-span-1">
                            <div className="card h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium leading-6 text-slate-900">
                                        Submitted Bids
                                        <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                                            {bids.length}
                                        </span>
                                    </h3>
                                    {userProfile?.role === 'EVALUATOR' && bids.length > 0 && isTenderActive && (
                                        <Link to={`/evaluator/evaluate/${tender.id}`} className="text-sm font-medium text-primary-600 hover:text-primary-500">
                                            Evaluate all &rarr;
                                        </Link>
                                    )}
                                </div>

                                {bids.length === 0 ? (
                                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                                        <svg className="mx-auto h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="mt-2 text-sm text-slate-500">No bids submitted yet</p>
                                    </div>
                                ) : (
                                    <ul className="space-y-4">
                                        {bids.map((bid) => (
                                            <li key={bid.id} className={`rounded-lg border p-4 transition-all ${bid.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-900">
                                                            {bid.companyName || 'Unknown Company'}
                                                        </h4>
                                                        <p className="text-xs text-slate-500">By: {bid.vendorName}</p>
                                                    </div>
                                                    {getBidStatusBadge(bid.status)}
                                                </div>

                                                <div className="text-xs text-slate-500 mb-3">
                                                    Submitted: {new Date(bid.submittedAt?.seconds * 1000).toLocaleDateString()}
                                                </div>

                                                {/* AI Summary */}
                                                {bid.aiAnalysis?.summary && (
                                                    <div className="bg-slate-50 rounded p-2 text-xs text-slate-600 mb-3 border border-slate-100">
                                                        <span className="font-semibold text-slate-700">AI Summary:</span> {bid.aiAnalysis.summary.slice(0, 100)}...
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                {canManageTender && isTenderActive && bid.status !== 'REJECTED' && (
                                                    <button
                                                        onClick={() => handleAcceptBid(bid)}
                                                        disabled={processingId === bid.id}
                                                        className="w-full mt-2 inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                                                    >
                                                        {processingId === bid.id ? 'Processing...' : 'Accept Bid'}
                                                    </button>
                                                )}

                                                {bid.status === 'APPROVED' && (
                                                    <div className="mt-2 text-center text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                                                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        WINNING BID
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TenderDetails;
