// Simplified Bid Evaluation Component - Accept/Reject Only
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTenderById, getBidsByTender, acceptBid, rejectBid } from '../../services/firebaseService';
import Navbar from '../layout/Navbar';
import LoadingSpinner from '../shared/LoadingSpinner';
import jsPDF from 'jspdf';

// Function to generate rejection PDF
const generateRejectionPDF = (bid, rejectionReason, evaluatorName) => {
    const doc = new jsPDF();

    // Add red header
    doc.setFillColor(234, 67, 53); // Google Red
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('BID REJECTION NOTICE', 105, 18, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Certificate body
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('AI Bid Evaluation Platform', 105, 45, { align: 'center' });

    // Border
    doc.setLineWidth(0.5);
    doc.rect(15, 55, 180, 120);

    // Content
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Dear Vendor,', 20, 70);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    const content = [
        { label: 'Company Name:', value: bid.companyName || 'N/A' },
        { label: 'Vendor:', value: bid.vendorName || 'N/A' },
        { label: 'Bid ID:', value: bid.id.slice(0, 12) },
        { label: 'Submission Date:', value: new Date(bid.submittedAt?.seconds * 1000).toLocaleDateString() },
        { label: 'Evaluation Date:', value: new Date().toLocaleDateString() },
        { label: 'Evaluated By:', value: evaluatorName || 'N/A' },
        { label: 'Status:', value: 'REJECTED ✗' }
    ];

    let yPos = 85;
    content.forEach(item => {
        doc.setFont('helvetica', 'bold');
        doc.text(item.label, 25, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(item.value, 80, yPos);
        yPos += 10;
    });

    // Rejection reason
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Rejection Reason:', 20, yPos + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const splitReason = doc.splitTextToSize(rejectionReason || 'No reason provided', 160);
    doc.text(splitReason, 25, yPos + 20);

    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('This is an electronically generated document', 105, 270, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 277, { align: 'center' });

    // Save
    doc.save(`Rejection_Notice_${bid.id.slice(0, 8)}.pdf`);
};

const EvaluateBids = () => {
    const { tenderId } = useParams();
    const { userProfile } = useAuth();
    const navigate = useNavigate();

    const [tender, setTender] = useState(null);
    const [bids, setBids] = useState([]);
    const [selectedBid, setSelectedBid] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [comments, setComments] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tenderData, bidsData] = await Promise.all([
                    getTenderById(tenderId),
                    getBidsByTender(tenderId)
                ]);

                setTender(tenderData);
                // Only show bids that haven't been evaluated yet
                const unevaluatedBids = bidsData.filter(b => b.status === 'SUBMITTED');
                setBids(unevaluatedBids);

                if (unevaluatedBids.length > 0) {
                    setSelectedBid(unevaluatedBids[0]);
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
        setComments('');
        setError('');
    };

    const handleAccept = async () => {
        if (!comments.trim()) {
            setError('Please provide evaluation comments before accepting');
            return;
        }

        setError('');
        setProcessing(true);

        try {
            await acceptBid(
                selectedBid.id,
                tender.id,
                userProfile.uid,
                userProfile.displayName,
                comments
            );

            alert('Bid accepted! Tender has been marked as COMPLETED.');

            // Redirect to dashboard after acceptance
            navigate('/evaluator/dashboard');
        } catch (err) {
            setError('Failed to accept bid: ' + err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!comments.trim()) {
            setError('Please provide a rejection reason');
            return;
        }

        setError('');
        setProcessing(true);

        try {
            await rejectBid(
                selectedBid.id,
                userProfile.uid,
                userProfile.displayName,
                comments
            );

            // Generate rejection PDF
            generateRejectionPDF(selectedBid, comments, userProfile.displayName);

            // Move to next bid or go back to dashboard
            const currentIndex = bids.findIndex(b => b.id === selectedBid.id);
            const remainingBids = bids.filter((_, index) => index !== currentIndex);

            if (remainingBids.length > 0) {
                setBids(remainingBids);
                setSelectedBid(remainingBids[0]);
                setComments('');
                alert('Bid rejected! Rejection PDF downloaded. Moving to next bid...');
            } else {
                alert('Bid rejected! Rejection PDF downloaded. No more bids to evaluate.');
                navigate('/evaluator/dashboard');
            }
        } catch (err) {
            setError('Failed to reject bid: ' + err.message);
        } finally {
            setProcessing(false);
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
            <div className="page-brutal flex items-center justify-center">
                <div className="card text-center max-w-2xl">
                    <h2 className="text-3xl font-black text-black mb-4 uppercase">No Bids to Evaluate</h2>
                    <p className="text-black font-bold mb-6">There are no pending bids for this tender.</p>
                    <button onClick={() => navigate('/evaluator/dashboard')} className="btn-primary">
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
                <div className="container-brutal max-w-7xl">
                    {/* Tender Info */}
                    <div className="card mb-8">
                        <h1 className="text-3xl font-black text-black mb-3 uppercase">{tender.title}</h1>
                        <p className="text-black font-semibold">{tender.description}</p>
                    </div>

                    {error && (
                        <div className="alert-error mb-8">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Bid List */}
                        <div className="lg:col-span-1">
                            <div className="card">
                                <h2 className="text-xl font-black text-black mb-4 uppercase">
                                    Pending Bids ({bids.length})
                                </h2>
                                <div className="space-y-3">
                                    {bids.map((bid) => (
                                        <button
                                            key={bid.id}
                                            onClick={() => handleBidSelect(bid)}
                                            className={`w-full text-left p-4 border-4 border-black font-bold transition-all duration-100 ${selectedBid?.id === bid.id
                                                    ? 'bg-google-blue text-white'
                                                    : 'bg-white hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="uppercase text-sm">{bid.companyName || 'Unknown Company'}</div>
                                            <div className="text-xs mt-1 opacity-90">
                                                {bid.vendorName} • {new Date(bid.submittedAt?.seconds * 1000).toLocaleDateString()}
                                            </div>
                                            {bid.complianceCheck && (
                                                <div className="mt-2">
                                                    <span className={`text-xs px-2 py-1 border-2 border-black font-bold ${bid.complianceCheck.passed
                                                            ? 'bg-google-green text-white'
                                                            : 'bg-google-yellow text-black'
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
                            <div className="card">
                                <h2 className="text-2xl font-black text-black mb-6 uppercase">
                                    Evaluate: {selectedBid?.companyName}
                                </h2>

                                {/* Bid Details */}
                                <div className="mb-6 p-6 border-4 border-black bg-gray-50">
                                    <h3 className="font-black text-black mb-3 uppercase text-sm">Proposal Summary</h3>
                                    <p className="text-black font-semibold mb-4">{selectedBid?.bidData?.proposalText}</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedBid?.bidData?.proposedCost && (
                                            <div>
                                                <span className="text-black font-bold text-sm uppercase">Cost:</span>
                                                <span className="ml-2 font-black text-google-blue">{selectedBid.bidData.proposedCost}</span>
                                            </div>
                                        )}
                                        {selectedBid?.bidData?.timeline && (
                                            <div>
                                                <span className="text-black font-bold text-sm uppercase">Timeline:</span>
                                                <span className="ml-2 font-black">{selectedBid.bidData.timeline}</span>
                                            </div>
                                        )}
                                        {selectedBid?.bidData?.experience && (
                                            <div>
                                                <span className="text-black font-bold text-sm uppercase">Experience:</span>
                                                <span className="ml-2 font-black">{selectedBid.bidData.experience}</span>
                                            </div>
                                        )}
                                        {selectedBid?.bidData?.teamSize && (
                                            <div>
                                                <span className="text-black font-bold text-sm uppercase">Team:</span>
                                                <span className="ml-2 font-black">{selectedBid.bidData.teamSize}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* AI Analysis Results */}
                                {selectedBid?.aiAnalysis && (
                                    <div className="mb-6 p-6 border-4 border-black bg-google-blue text-white">
                                        <h3 className="font-black mb-3 uppercase text-sm">AI Analysis</h3>
                                        <p className="font-semibold">{selectedBid.aiAnalysis.summary}</p>
                                    </div>
                                )}

                                {/* Compliance Check */}
                                {selectedBid?.complianceCheck && (
                                    <div className={`mb-6 p-6 border-4 border-black ${selectedBid.complianceCheck.passed
                                            ? 'bg-google-green text-white'
                                            : 'bg-google-yellow text-black'
                                        }`}>
                                        <h3 className="font-black mb-3 uppercase text-sm">Compliance Check</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="font-black text-2xl">
                                                {selectedBid.complianceCheck.passed ? '✅ PASSED' : '⚠️ ISSUES FOUND'}
                                            </span>
                                            <span className="font-black text-2xl">
                                                {selectedBid.complianceCheck.score}/100
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="divider"></div>

                                {/* Evaluation Comments */}
                                <div className="mb-8">
                                    <label className="label">Evaluation Comments / Rejection Reason *</label>
                                    <textarea
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        rows={5}
                                        className="input-field"
                                        placeholder="Provide detailed feedback. If rejecting, explain the reason clearly..."
                                        required
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={handleReject}
                                        disabled={processing || !comments.trim()}
                                        className="btn-danger disabled:opacity-50"
                                    >
                                        {processing ? 'PROCESSING...' : '✗ REJECT BID'}
                                    </button>
                                    <button
                                        onClick={handleAccept}
                                        disabled={processing || !comments.trim()}
                                        className="btn-success disabled:opacity-50"
                                    >
                                        {processing ? 'PROCESSING...' : '✓ ACCEPT BID'}
                                    </button>
                                </div>

                                <div className="mt-4 p-4 border-4 border-black bg-google-yellow text-black font-bold text-sm text-center">
                                    ⚠️ Accept will CLOSE this tender. Reject will keep it OPEN for other vendors.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EvaluateBids;
