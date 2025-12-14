// Vendor Dashboard Component - Brutal Neobrutalism Style
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
            <div className="page-brutal">
                <div className="container-brutal">
                    {/* Error Message */}
                    {error && (
                        <div className="alert-error mb-6">
                            {error}
                        </div>
                    )}

                    {/* Welcome Section */}
                    <div className="card mb-8">
                        <h1 className="text-4xl font-black text-black mb-2 uppercase tracking-tight">
                            Welcome, {userProfile?.displayName}!
                        </h1>
                        <p className="text-black font-bold">
                            {userProfile?.companyName && `${userProfile.companyName} - `}
                            Manage your tenders and bids
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="stat-card-blue">
                            <p className="text-sm font-bold mb-2 uppercase">Active Tenders</p>
                            <p className="text-5xl font-black">{allTenders.length}</p>
                        </div>

                        <div className="stat-card-green">
                            <p className="text-sm font-bold mb-2 uppercase">My Bids</p>
                            <p className="text-5xl font-black">{myBids.length}</p>
                        </div>

                        <div className="stat-card-yellow">
                            <p className="text-sm font-bold mb-2 uppercase">Pending Review</p>
                            <p className="text-5xl font-black">
                                {myBids.filter(b => b.status === 'SUBMITTED').length}
                            </p>
                        </div>
                    </div>

                    {/* Available Tenders */}
                    <div className="card mb-8">
                        <h2 className="text-3xl font-black text-black mb-6 uppercase">Available Tenders</h2>

                        {allTenders.length === 0 ? (
                            <p className="text-black font-bold text-center py-8">No active tenders available</p>
                        ) : (
                            <div className="space-y-4">
                                {allTenders.slice(0, 5).map((tender) => (
                                    <div key={tender.id} className="border-4 border-black p-6">
                                        <h3 className="font-black text-2xl text-black mb-3">{tender.title}</h3>
                                        <p className="text-black font-semibold mb-4 line-clamp-2">{tender.description}</p>
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-4">
                                                <span className="font-bold text-black">
                                                    Deadline: {new Date(tender.deadline?.seconds * 1000).toLocaleDateString()}
                                                </span>
                                                <span className="badge-green">OPEN</span>
                                            </div>
                                            <Link
                                                to={`/vendor/submit-bid/${tender.id}`}
                                                className="btn-primary"
                                            >
                                                SUBMIT BID
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Bids */}
                    <div className="card">
                        <h2 className="text-3xl font-black text-black mb-6 uppercase">My Recent Bids</h2>

                        {myBids.length === 0 ? (
                            <p className="text-black font-bold text-center py-8">You haven't submitted any bids yet</p>
                        ) : (
                            <div className="space-y-4">
                                {myBids.slice(0, 3).map((bid) => (
                                    <div key={bid.id} className="border-4 border-black p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-black text-xl text-black">BID #{bid.id.slice(0, 8)}</h3>
                                            <span className={`px-4 py-2 border-4 border-black font-bold uppercase ${bid.status === 'SUBMITTED' ? 'bg-google-blue text-white' :
                                                    bid.status === 'EVALUATED' ? 'bg-purple-500 text-white' :
                                                        bid.status === 'APPROVED' ? 'bg-google-green text-white' :
                                                            bid.status === 'REJECTED' ? 'bg-google-red text-white' :
                                                                bid.status === 'UNDER_REVIEW' ? 'bg-google-yellow text-black' :
                                                                    'bg-gray-300 text-black'
                                                }`}>
                                                {bid.status}
                                            </span>
                                        </div>
                                        <p className="text-black font-semibold mb-3">
                                            Submitted: {new Date(bid.submittedAt?.seconds * 1000).toLocaleString()}
                                        </p>

                                        {/* Show evaluation details if evaluated */}
                                        {bid.evaluatorName && (
                                            <div className="mt-4 p-4 bg-google-blue border-4 border-black text-white">
                                                <p className="font-bold">
                                                    Evaluated by: {bid.evaluatorName}
                                                </p>
                                                <p className="text-sm mt-1">
                                                    {new Date(bid.evaluatedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        )}

                                        {bid.aiAnalysis?.summary && (
                                            <p className="text-black font-semibold mt-3">
                                                AI Summary: {bid.aiAnalysis.summary.slice(0, 100)}...
                                            </p>
                                        )}

                                        {/* Download Approval PDF button */}
                                        {bid.status === 'APPROVED' && (
                                            <button
                                                onClick={() => generateApprovalPDF(bid)}
                                                className="mt-4 w-full btn-success"
                                            >
                                                📄 DOWNLOAD APPROVAL CERTIFICATE
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
