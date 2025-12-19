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

    const canManageTender = ['PROCUREMENT_OFFICER', 'ADMIN'].includes(userProfile?.role);
    const isTenderActive = tender.status === 'OPEN' || tender.status === 'EVALUATING';

    return (
        <>
            <Navbar />
            <div className="page-brutal">
                <div className="container-brutal max-w-7xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="btn-secondary">
                            ← Back
                        </button>
                        <h1 className="text-4xl font-black text-black uppercase">Tender Details</h1>
                    </div>

                    {/* Tender Info */}
                    <div className="card mb-8">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-3xl font-black text-black mb-2 uppercase">{tender.title}</h2>
                                <p className="text-black font-semibold">{tender.description}</p>
                            </div>
                            <span className={`px-4 py-2 border-4 border-black font-bold uppercase ${tender.status === 'OPEN' ? 'bg-google-green text-white' :
                                tender.status === 'EVALUATING' ? 'bg-google-yellow text-black' :
                                    tender.status === 'CLOSED' ? 'bg-gray-400 text-white' :
                                        'bg-google-blue text-white'
                                }`}>
                                {tender.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 border-t-4 border-black pt-6">
                            <div>
                                <h3 className="font-black text-black uppercase mb-1">Deadline</h3>
                                <p className="text-black font-semibold">
                                    {new Date(tender.deadline?.seconds * 1000).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-black text-black uppercase mb-1">Created By</h3>
                                <p className="text-black font-semibold">{tender.createdBy}</p>
                            </div>
                        </div>

                        {/* Requirements */}
                        {tender.requirements && (
                            <div className="mt-6 border-t-4 border-black pt-6">
                                <h3 className="font-black text-black uppercase mb-3">Requirements</h3>
                                <div className="bg-gray-100 border-4 border-black p-4 space-y-2">
                                    {tender.requirements.minExperience && (
                                        <p className="text-sm text-black font-bold">
                                            <span className="uppercase opacity-70">Minimum Experience:</span> {tender.requirements.minExperience} years
                                        </p>
                                    )}
                                    {tender.requirements.requiredCertifications && tender.requirements.requiredCertifications.length > 0 && (
                                        <p className="text-sm text-black font-bold">
                                            <span className="uppercase opacity-70">Required Certifications:</span> {tender.requirements.requiredCertifications.join(', ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bids Section */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-black text-black uppercase">Submitted Bids ({bids.length})</h2>
                            {userProfile?.role === 'EVALUATOR' && bids.length > 0 && isTenderActive && (
                                <Link
                                    to={`/evaluator/evaluate/${tender.id}`}
                                    className="btn-primary"
                                >
                                    EVALUATE BIDS
                                </Link>
                            )}
                        </div>

                        {bids.length === 0 ? (
                            <p className="text-black font-bold text-center py-8 border-4 border-black border-dashed">No bids submitted yet</p>
                        ) : (
                            <div className="space-y-4">
                                {bids.map((bid) => (
                                    <div key={bid.id} className={`border-4 border-black p-6 ${bid.status === 'APPROVED' ? 'bg-google-green text-white' : 'bg-white'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className={`font-black text-xl uppercase ${bid.status === 'APPROVED' ? 'text-white' : 'text-black'}`}>
                                                    {bid.companyName || 'Unknown Company'}
                                                </h3>
                                                <p className={`text-sm font-semibold ${bid.status === 'APPROVED' ? 'text-white' : 'text-gray-600'}`}>
                                                    Submitted by: {bid.vendorName}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 border-4 border-black font-bold uppercase text-sm ${bid.status === 'SUBMITTED' ? 'bg-google-blue text-white' :
                                                bid.status === 'EVALUATED' ? 'bg-purple-500 text-white' :
                                                    bid.status === 'APPROVED' ? 'bg-white text-black' :
                                                        'bg-google-red text-white'
                                                }`}>
                                                {bid.status}
                                            </span>
                                        </div>

                                        <p className={`text-sm font-bold mb-3 ${bid.status === 'APPROVED' ? 'text-white' : 'text-black'}`}>
                                            Submitted: {new Date(bid.submittedAt?.seconds * 1000).toLocaleString()}
                                        </p>

                                        {/* AI Summary */}
                                        {bid.aiAnalysis?.summary && (
                                            <div className={`mt-3 p-3 border-4 border-black ${bid.status === 'APPROVED' ? 'bg-white text-black' : 'bg-gray-100'}`}>
                                                <p className="text-sm font-semibold">
                                                    <span className="font-black uppercase">AI Summary:</span> {bid.aiAnalysis.summary.slice(0, 150)}...
                                                </p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        {canManageTender && isTenderActive && bid.status !== 'REJECTED' && (
                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    onClick={() => handleAcceptBid(bid)}
                                                    disabled={processingId === bid.id}
                                                    className="btn-success text-sm py-2 px-4 shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all"
                                                >
                                                    {processingId === bid.id ? 'PROCESSING...' : '✓ ACCEPT THIS BID'}
                                                </button>
                                            </div>
                                        )}

                                        {bid.status === 'APPROVED' && (
                                            <div className="mt-4 text-right">
                                                <span className="font-black text-white text-lg uppercase tracking-widest border-b-4 border-white pb-1">Winning Bid</span>
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
