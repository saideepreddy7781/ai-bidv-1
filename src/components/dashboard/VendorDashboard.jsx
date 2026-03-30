// Vendor Dashboard Component - Professional Style
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllTenders, getBidsByVendor } from '../../services/firebaseService';
import LoadingSpinner from '../shared/LoadingSpinner';
import Navbar from '../layout/Navbar';
import { generateApprovalPdfBlob, generateRejectionPdfBlob, downloadBlob } from '../../services/pdfService';

// Animation Components
import AnimatedCard from '../animations/AnimatedCard';
import StaggerContainer, { StaggerItem } from '../animations/StaggerContainer';
import AnimatedButton from '../animations/AnimatedButton';

const VendorDashboard = () => {
    const { userProfile } = useAuth();
    const [allTenders, setAllTenders] = useState([]);
    const [myBids, setMyBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setError('');
                const [tendersData, bidsData] = await Promise.all([
                    getAllTenders(),
                    getBidsByVendor(userProfile.uid)
                ]);

                // Filter for OPEN tenders only
                const openTenders = tendersData.filter(t => t.status === 'OPEN');
                setAllTenders(openTenders);
                setMyBids(bidsData);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load tenders: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        if (userProfile?.uid) {
            fetchData();
        }
    }, [userProfile]);

    const getBidStatusBadge = (status) => {
        const styles = {
            'SUBMITTED': 'bg-blue-100 text-blue-800 border-blue-200',
            'EVALUATED': 'bg-purple-100 text-purple-800 border-purple-200',
            'APPROVED': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'REJECTED': 'bg-red-100 text-red-800 border-red-200',
            'UNDER_REVIEW': 'bg-amber-100 text-amber-800 border-amber-200'
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

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <div className="text-sm text-red-700">{error}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            Welcome, {userProfile?.displayName}!
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {userProfile?.companyName ? `${userProfile.companyName} - ` : ''}
                            Manage your tenders and track bid status.
                        </p>
                    </div>

                    {/* Stats */}
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StaggerItem>
                            <AnimatedCard className="card bg-white p-6 shadow-sm rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Opportunities</p>
                                        <p className="mt-2 text-3xl font-semibold text-slate-900">{allTenders.length}</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                </div>
                            </AnimatedCard>
                        </StaggerItem>

                        <StaggerItem>
                            <AnimatedCard className="card bg-white p-6 shadow-sm rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">My Submissions</p>
                                        <p className="mt-2 text-3xl font-semibold text-slate-900">{myBids.length}</p>
                                    </div>
                                    <div className="p-3 bg-emerald-50 rounded-lg">
                                        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </AnimatedCard>
                        </StaggerItem>

                        <StaggerItem>
                            <AnimatedCard className="card bg-white p-6 shadow-sm rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Pending Review</p>
                                        <p className="mt-2 text-3xl font-semibold text-slate-900">
                                            {myBids.filter(b => b.status === 'SUBMITTED').length}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-amber-50 rounded-lg">
                                        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </AnimatedCard>
                        </StaggerItem>
                    </StaggerContainer>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Available Tenders */}
                        <div className="card h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-slate-900">Available Tenders</h2>
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                                    {allTenders.length}
                                </span>
                            </div>

                            {allTenders.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                                    <p className="text-sm text-slate-500">No active tenders available at the moment.</p>
                                </div>
                            ) : (
                                <StaggerContainer className="space-y-4">
                                    {allTenders.slice(0, 5).map((tender) => (
                                        <StaggerItem key={tender.id}>
                                            <AnimatedCard className="group relative rounded-lg border border-slate-200 bg-white p-5 hover:border-slate-300 transition-all">
                                                <div className="flex justify-between items-start">
                                                    <div className="pr-4">
                                                        <h3 className="text-base font-semibold leading-6 text-slate-900 mb-1">
                                                            {tender.title}
                                                        </h3>
                                                        <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                                                            {tender.description}
                                                        </p>
                                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                Deadline: {new Date(tender.deadline?.seconds * 1000).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-3">
                                                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                                            OPEN
                                                        </span>
                                                        <Link
                                                            to={`/vendor/submit-bid/${tender.id}`}
                                                            className="text-sm font-medium text-primary-600 hover:text-primary-500"
                                                        >
                                                            Submit Bid &rarr;
                                                        </Link>
                                                    </div>
                                                </div>
                                            </AnimatedCard>
                                        </StaggerItem>
                                    ))}
                                </StaggerContainer>
                            )}
                        </div>

                        {/* Recent Bids */}
                        <div className="card h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-slate-900">My Recent Bids</h2>
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                                    {myBids.length}
                                </span>
                            </div>

                            {myBids.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                                    <svg className="mx-auto h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="mt-2 text-sm text-slate-500">You haven't submitted any bids yet</p>
                                </div>
                            ) : (
                                <StaggerContainer className="space-y-4">
                                    {myBids.slice(0, 5).map((bid) => (
                                        <StaggerItem key={bid.id}>
                                            <AnimatedCard className="rounded-lg border border-slate-200 bg-white p-5 hover:bg-slate-50 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-sm font-bold text-slate-900">Ref: {bid.id.slice(0, 8).toUpperCase()}</h3>
                                                        <p className="text-xs text-slate-500">
                                                            Submitted: {new Date(bid.submittedAt?.seconds * 1000).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    {getBidStatusBadge(bid.status)}
                                                </div>

                                                {/* AI Summary */}
                                                {bid.aiAnalysis?.summary && (
                                                    <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                                                        <span className="font-semibold text-slate-700">AI Summary:</span> {bid.aiAnalysis.summary}
                                                    </p>
                                                )}

                                                {/* Approved Actions */}
                                                {bid.status === 'APPROVED' && (
                                                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                                                        <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                                                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            Awarded
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                if (bid.approvalPdfUrl) {
                                                                    window.open(bid.approvalPdfUrl, '_blank');
                                                                } else {
                                                                    const blob = generateApprovalPdfBlob(bid);
                                                                    downloadBlob(blob, `approval_${bid.id}.pdf`);
                                                                }
                                                            }}
                                                            className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                                            </svg>
                                                            Download Certificate
                                                        </button>
                                                    </div>
                                                )}

                                                {bid.status === 'REJECTED' && (
                                                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                                                        <span className="text-xs font-medium text-red-700 flex items-center gap-1">
                                                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.293a1 1 0 00-1.414-1.414L10 8.586 7.707 6.293a1 1 0 00-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 101.414 1.414L10 11.414l2.293 2.293a1 1 0 001.414-1.414L11.414 10l2.293-2.293z" clipRule="evenodd" />
                                                            </svg>
                                                            Not Selected
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                if (bid.rejectionPdfUrl) {
                                                                    window.open(bid.rejectionPdfUrl, '_blank');
                                                                } else {
                                                                    const blob = generateRejectionPdfBlob(
                                                                        bid,
                                                                        bid.rejectionReason || bid.evaluationComments || 'Bid was not selected for award.',
                                                                        bid.evaluatorName || 'Procurement Officer'
                                                                    );
                                                                    downloadBlob(blob, `rejection_${bid.id}.pdf`);
                                                                }
                                                            }}
                                                            className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                                            </svg>
                                                            Download Rejection Notice
                                                        </button>
                                                    </div>
                                                )}
                                            </AnimatedCard>
                                        </StaggerItem>
                                    ))}
                                </StaggerContainer>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VendorDashboard;
