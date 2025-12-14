// Vendor Dashboard Component
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllTenders, getBidsByVendor } from '../../services/firebaseService';
import LoadingSpinner from '../shared/LoadingSpinner';
import Navbar from '../layout/Navbar';
import jsPDF from 'jspdf';

// Function to generate approval PDF
const generateApprovalPDF = (bid) => {
    const doc = new jsPDF();

    //Add header
    doc.setFillColor(34, 139, 34); // Green
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('BID APPROVAL CERTIFICATE', 105, 18, { align: 'center' });

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
    doc.text('This is to certify that:', 20, 70);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    const content = [
        { label: 'Company Name:', value: bid.companyName || 'N/A' },
        { label: 'Vendor:', value: bid.vendorName || 'N/A' },
        { label: 'Bid ID:', value: bid.id },
        { label: 'Submission Date:', value: new Date(bid.submittedAt?.seconds * 1000).toLocaleDateString() },
        { label: 'Evaluation Date:', value: bid.evaluatedAt ? new Date(bid.evaluatedAt).toLocaleDateString() : 'N/A' },
        { label: 'Evaluated By:', value: bid.evaluatorName || 'N/A' },
        { label: 'Status:', value: 'APPROVED ✓' }
    ];

    let yPos = 85;
    content.forEach(item => {
        doc.setFont('helvetica', 'bold');
        doc.text(item.label, 25, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(item.value, 80, yPos);
        yPos += 10;
    });

    // Approval statement
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Your bid has been APPROVED', 105, 160, { align: 'center' });

    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('This is an electronically generated document', 105, 185, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 192, { align: 'center' });

    // Save
    doc.save(`Approval_Certificate_${bid.id.slice(0, 8)}.pdf`);
};

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

                console.log('Fetched tenders:', tendersData); // Debug log

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
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Welcome Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome back, {userProfile?.displayName}!
                        </h1>
                        <p className="text-gray-600">
                            {userProfile?.companyName && `${userProfile.companyName} - `}
                            Manage your tenders and bids
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Active Tenders</p>
                                    <p className="text-3xl font-bold text-blue-600">{allTenders.length}</p>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">My Bids</p>
                                    <p className="text-3xl font-bold text-green-600">{myBids.length}</p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-full">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Pending Review</p>
                                    <p className="text-3xl font-bold text-yellow-600">
                                        {myBids.filter(b => b.status === 'SUBMITTED').length}
                                    </p>
                                </div>
                                <div className="bg-yellow-100 p-3 rounded-full">
                                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Available Tenders */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Available Tenders</h2>
                        </div>

                        {allTenders.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No active tenders available</p>
                        ) : (
                            <div className="space-y-4">
                                {allTenders.slice(0, 5).map((tender) => (
                                    <div key={tender.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <h3 className="font-semibold text-lg text-gray-900 mb-2">{tender.title}</h3>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tender.description}</p>
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-4 text-sm text-gray-500">
                                                <span>Deadline: {new Date(tender.deadline?.seconds * 1000).toLocaleDateString()}</span>
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Open</span>
                                            </div>
                                            <Link
                                                to={`/vendor/submit-bid/${tender.id}`}
                                                className="btn-primary text-sm"
                                            >
                                                Submit Bid
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Bids */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Recent Bids</h2>

                        {myBids.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">You haven't submitted any bids yet</p>
                        ) : (
                            <div className="space-y-4">
                                {myBids.slice(0, 3).map((bid) => (
                                    <div key={bid.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-gray-900">Bid #{bid.id.slice(0, 8)}</h3>
                                            <span className={`px-3 py-1 rounded text-sm font-semibold ${bid.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                                                bid.status === 'EVALUATED' ? 'bg-purple-100 text-purple-800' :
                                                    bid.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                        bid.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                            bid.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                }`}>
                                                {bid.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Submitted: {new Date(bid.submittedAt?.seconds * 1000).toLocaleString()}
                                        </p>

                                        {/* Show evaluation details if evaluated */}
                                        {bid.evaluatorName && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                <p className="text-sm font-semibold text-blue-900">
                                                    Evaluated by: {bid.evaluatorName}
                                                </p>
                                                <p className="text-xs text-blue-700 mt-1">
                                                    {new Date(bid.evaluatedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        )}

                                        {bid.aiAnalysis?.summary && (
                                            <p className="text-sm text-gray-600 mt-2">
                                                AI Summary: {bid.aiAnalysis.summary.slice(0, 100)}...
                                            </p>
                                        )}

                                        {/* Download Approval PDF button */}
                                        {bid.status === 'APPROVED' && (
                                            <button
                                                onClick={() => generateApprovalPDF(bid)}
                                                className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-4 rounded-lg"
                                            >
                                                📄 Download Approval Certificate
                                            </button>
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

export default VendorDashboard;
