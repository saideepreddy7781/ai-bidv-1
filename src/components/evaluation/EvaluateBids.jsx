// Simplified Bid Evaluation Component - Accept/Reject Only
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getTenderById, getBidsByTender, acceptBid, rejectBid } from '../../services/firebaseService';
import { generateRejectionPdfBlob, generateApprovalPdfBlob, downloadBlob } from '../../services/pdfService';
import { generateEvaluationRecommendations } from '../../services/geminiService';
import Navbar from '../layout/Navbar';
import LoadingSpinner from '../shared/LoadingSpinner';
import StaggerContainer, { StaggerItem } from '../animations/StaggerContainer';
import AnimatedButton from '../animations/AnimatedButton';

const EvaluateBids = () => {
    const { tenderId } = useParams();
    const { userProfile } = useAuth();
    const navigate = useNavigate();

    const [tender, setTender] = useState(null);
    const [bids, setBids] = useState([]);
    const [selectedBid, setSelectedBid] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');
    const [error, setError] = useState('');
    const [comments, setComments] = useState('');

    // AI Analysis State
    const [analyzing, setAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState(null);

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
        setAiAnalysis(null); // Reset AI analysis for new bid
    };

    const handleAnalyzeBid = async () => {
        if (!selectedBid) return;

        setAnalyzing(true);
        setError('');

        try {
            // Standard evaluation criteria
            const criteria = [
                { name: "Technical Capability", weight: 35, description: "Ability to deliver technical requirements" },
                { name: "Financial Proposal", weight: 25, description: "Cost effectiveness and transparency" },
                { name: "Experience & Track Record", weight: 20, description: "Past performance and relevant experience" },
                { name: "Compliance", weight: 20, description: "Adherence to tender requirements" }
            ];

            const analysis = await generateEvaluationRecommendations(selectedBid, criteria);
            setAiAnalysis(analysis);
        } catch (err) {
            console.error(err);
            setError('Failed to analyze bid: ' + err.message);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleAccept = async () => {
        if (!comments.trim()) {
            setError('Please provide evaluation comments before accepting');
            return;
        }

        setError('');
        setProcessing(true);
        setProcessingStatus('Finalizing Record...');

        try {
            // 1. Generate Approval PDF (Local Download Only)
            const pdfBlob = generateApprovalPdfBlob(selectedBid);
            const filename = `approval_${selectedBid.id}.pdf`;

            // 2. Update DB (Skip upload)
            await acceptBid(
                selectedBid.id,
                tender.id,
                userProfile.uid,
                userProfile.displayName,
                comments,
                null // No PDF URL stored
            );

            // 3. Download locally for evaluator's reference
            downloadBlob(pdfBlob, filename);

            alert('Bid accepted! Tender has been marked as COMPLETED.');

            // Redirect to dashboard after acceptance
            navigate('/evaluator/dashboard');
        } catch (err) {
            setError('Failed to accept bid: ' + err.message);
        } finally {
            setProcessing(false);
            setProcessingStatus('');
        }
    };

    const handleReject = async () => {
        if (!comments.trim()) {
            setError('Please provide a rejection reason');
            return;
        }

        setError('');
        setProcessing(true);
        setProcessingStatus('Updating Bid Status...');

        try {
            // 1. Generate Rejection PDF (Local Download Only)
            const pdfBlob = generateRejectionPdfBlob(selectedBid, comments, userProfile.displayName);
            const filename = `rejection_${selectedBid.id}.pdf`;

            // 2. Update DB (Skip upload)
            await rejectBid(
                selectedBid.id,
                userProfile.uid,
                userProfile.displayName,
                comments,
                null // No PDF URL stored
            );

            // 3. Download locally
            downloadBlob(pdfBlob, filename);

            // Move to next bid or go back to dashboard
            const currentIndex = bids.findIndex(b => b.id === selectedBid.id);
            const remainingBids = bids.filter((_, index) => index !== currentIndex);

            if (remainingBids.length > 0) {
                setBids(remainingBids);
                setSelectedBid(remainingBids[0]);
                setComments('');
                setAiAnalysis(null);
                alert('Bid rejected! Rejection PDF saved and downloaded. Moving to next bid...');
            } else {
                alert('Bid rejected! Rejection PDF saved and downloaded. No more bids to evaluate.');
                navigate('/evaluator/dashboard');
            }
        } catch (err) {
            setError('Failed to reject bid: ' + err.message);
        } finally {
            setProcessing(false);
            setProcessingStatus('');
        }
    };

    if (loading) return (
        <>
            <Navbar />
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                <LoadingSpinner />
            </div>
        </>
    );

    if (!tender || bids.length === 0) return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md w-full"
                >
                    <div className="mx-auto h-12 w-12 text-slate-400 mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No Bids to Evaluate</h2>
                    <p className="text-slate-500 mb-6">There are no pending bids available for this tender.</p>
                    <button
                        onClick={() => navigate('/evaluator/dashboard')}
                        className="w-full inline-flex justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </motion.div>
            </div>
        </>
    );

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Tender Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                            <Link to="/evaluator/dashboard" className="hover:text-slate-900 transition-colors">Evaluator Dashboard</Link>
                            <svg className="h-3 w-3 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M5.536 21.886a1.004 1.004 0 0 0 1.033-.064l13-9a1 1 0 0 0 0-1.644l-13-9A1 1 0 0 0 5 3v18a1 1 0 0 0 .536.886z" />
                            </svg>
                            <span className="font-medium text-slate-900">Evaluate Bids</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">{tender.title}</h1>
                        <p className="text-slate-600 max-w-4xl">{tender.description}</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 rounded-md bg-red-50 p-4 border border-red-200"
                        >
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
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column: Bid List */}
                        <div className="lg:col-span-4">
                            <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden sticky top-24">
                                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                                    <h2 className="font-semibold text-slate-900">Pending Bids</h2>
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                        {bids.length}
                                    </span>
                                </div>
                                <StaggerContainer className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                                    {bids.map((bid) => (
                                        <StaggerItem key={bid.id}>
                                            <button
                                                onClick={() => handleBidSelect(bid)}
                                                className={`w-full text-left p-4 transition-all duration-200 hover:bg-slate-50 ${selectedBid?.id === bid.id
                                                    ? 'bg-blue-50/50 border-l-4 border-blue-600'
                                                    : 'border-l-4 border-transparent'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-semibold text-slate-900 text-sm truncate pr-2">
                                                        {bid.companyName || 'Unknown Company'}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-500 mb-2">
                                                    {bid.vendorName} • {new Date(bid.submittedAt?.seconds * 1000).toLocaleDateString()}
                                                </div>
                                                {bid.complianceCheck && (
                                                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium border ${bid.complianceCheck.passed
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}>
                                                        Compliance: {bid.complianceCheck.score}/100
                                                    </span>
                                                )}
                                            </button>
                                        </StaggerItem>
                                    ))}
                                </StaggerContainer>
                            </div>
                        </div>

                        {/* Right Column: Evaluation Form */}
                        <div className="lg:col-span-8">
                            <div className="bg-white shadow-sm rounded-xl border border-slate-200">
                                {/* Header */}
                                <div className="p-6 border-b border-slate-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">
                                                Evaluate: {selectedBid?.companyName}
                                            </h2>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Bid Ref: {selectedBid?.id}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-8">
                                    {/* Proposal Section */}
                                    <section>
                                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
                                            Proposal Details
                                        </h3>
                                        <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                                            <p className="text-slate-700 mb-6 whitespace-pre-line text-sm leading-relaxed">
                                                {selectedBid?.bidData?.proposalText}
                                            </p>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 pt-4 border-t border-slate-200">
                                                {selectedBid?.bidData?.proposedCost && (
                                                    <div>
                                                        <span className="text-xs font-medium text-slate-500 uppercase block mb-1">Proposed Cost</span>
                                                        <span className="text-base font-bold text-slate-900">{selectedBid.bidData.proposedCost}</span>
                                                    </div>
                                                )}
                                                {selectedBid?.bidData?.timeline && (
                                                    <div>
                                                        <span className="text-xs font-medium text-slate-500 uppercase block mb-1">Timeline</span>
                                                        <span className="text-sm font-medium text-slate-900">{selectedBid.bidData.timeline}</span>
                                                    </div>
                                                )}
                                                {selectedBid?.bidData?.experience && (
                                                    <div>
                                                        <span className="text-xs font-medium text-slate-500 uppercase block mb-1">Experience</span>
                                                        <span className="text-sm font-medium text-slate-900">{selectedBid.bidData.experience}</span>
                                                    </div>
                                                )}
                                                {selectedBid?.bidData?.teamSize && (
                                                    <div>
                                                        <span className="text-xs font-medium text-slate-500 uppercase block mb-1">Team Size</span>
                                                        <span className="text-sm font-medium text-slate-900">{selectedBid.bidData.teamSize}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </section>

                                    {/* AI Proposal Analysis */}
                                    {selectedBid?.aiAnalysis && (
                                        <section>
                                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
                                                Initial AI Scan
                                            </h3>
                                            <div className="rounded-lg bg-blue-50 p-4 border border-blue-100 mb-6">
                                                <div className="flex">
                                                    <div className="flex-shrink-0">
                                                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-3">
                                                        <h3 className="text-sm font-medium text-blue-800">Key Information Extracted</h3>
                                                        <p className="mt-2 text-sm text-blue-700">{selectedBid.aiAnalysis.summary}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    {/* AI Decision Support */}
                                    <section>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                                                AI Decision Support by Groq
                                            </h3>
                                            <AnimatePresence>
                                                {!aiAnalysis && !analyzing && (
                                                    <motion.button
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        onClick={handleAnalyzeBid}
                                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                        Analyze Bid
                                                    </motion.button>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <AnimatePresence>
                                            {analyzing && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-8 border border-dashed border-indigo-200 rounded-lg bg-indigo-50 flex flex-col items-center justify-center">
                                                        <LoadingSpinner size="md" color="text-indigo-600" />
                                                        <p className="mt-4 text-sm font-medium text-indigo-700">Analyzing proposal against criteria...</p>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {aiAnalysis && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                                    className="bg-white rounded-lg border border-indigo-100 shadow-sm overflow-hidden"
                                                >
                                                    <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 flex justify-between items-center">
                                                        <div>
                                                            <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">AI Recommendation</p>
                                                            <h4 className="text-lg font-bold text-slate-900">{aiAnalysis.overall_recommendation}</h4>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-medium text-slate-500">Confidence</p>
                                                            <p className="text-lg font-bold text-slate-900">{Math.round((aiAnalysis.confidence || 0) * 100)}%</p>
                                                        </div>
                                                    </div>
                                                    <div className="p-5">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                            <div>
                                                                <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">Scoring Breakdown</h5>
                                                                <div className="space-y-3">
                                                                    {Object.entries(aiAnalysis.scores || {}).map(([criterion, score]) => (
                                                                        <div key={criterion}>
                                                                            <div className="flex justify-between text-sm mb-1">
                                                                                <span className="text-slate-700">{criterion}</span>
                                                                                <span className="font-semibold text-slate-900">{score} pts</span>
                                                                            </div>
                                                                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                                                <div
                                                                                    className="bg-indigo-600 h-1.5 rounded-full"
                                                                                    style={{ width: `${(score / 35) * 100}%` }} // Approximate max
                                                                                ></div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                                                                        <span className="font-bold text-slate-900">Total Score</span>
                                                                        <span className="font-black text-indigo-600 text-lg">{aiAnalysis.totalScore}/100</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">Key Findings</h5>
                                                                <ul className="space-y-2">
                                                                    {aiAnalysis.key_findings?.map((finding, idx) => (
                                                                        <li key={idx} className="flex gap-2 text-sm text-slate-600">
                                                                            <span className="text-indigo-500 mt-0.5">•</span>
                                                                            {finding}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                                {/* Populate comments with AI summary if empty */}
                                                                <button
                                                                    onClick={() => setComments(aiAnalysis.reasoning ? JSON.stringify(aiAnalysis.reasoning, null, 2) : "Based on AI Analysis...")}
                                                                    className="mt-4 text-xs font-medium text-indigo-600 hover:text-indigo-800 underline"
                                                                >
                                                                    Use reasoning as comment
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </section>

                                    {/* Compliance */}
                                    {selectedBid?.complianceCheck && (
                                        <section>
                                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
                                                Compliance Status
                                            </h3>
                                            <div className={`rounded-lg p-5 border ${selectedBid.complianceCheck.passed
                                                ? 'bg-emerald-50 border-emerald-100'
                                                : 'bg-amber-50 border-amber-100'
                                                }`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-full ${selectedBid.complianceCheck.passed ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                                            {selectedBid.complianceCheck.passed ? (
                                                                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className={`text-base font-bold ${selectedBid.complianceCheck.passed ? 'text-emerald-900' : 'text-amber-900'}`}>
                                                                {selectedBid.complianceCheck.passed ? 'Compliance Check Passed' : 'Compliance Issues Detected'}
                                                            </h4>
                                                            <p className={`text-sm ${selectedBid.complianceCheck.passed ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                                Automated system check completed
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block text-2xl font-bold text-slate-900">{selectedBid.complianceCheck.score}/100</span>
                                                        <span className="text-xs text-slate-500 uppercase tracking-wide">Score</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    <hr className="border-slate-200" />

                                    {/* Action Area */}
                                    <section>
                                        <div className="bg-white rounded-lg">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="order-2 md:order-1">
                                                    <label htmlFor="comments" className="block text-sm font-medium text-slate-700 mb-2">
                                                        Evaluation Comments / Rejection Reason <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea
                                                        id="comments"
                                                        value={comments}
                                                        onChange={(e) => setComments(e.target.value)}
                                                        rows={5}
                                                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-slate-900 border p-3"
                                                        placeholder="Provide detailed feedback. If rejecting, please explain the reason clearly for the vendor..."
                                                        required
                                                    />
                                                </div>
                                                <div className="order-1 md:order-2 bg-slate-50 p-4 rounded-lg border border-slate-200 h-fit">
                                                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Decision Guidelines</h4>
                                                    <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                                                        <li><b>Accepting</b> a bid will mark this tender as <span className="text-blue-600 font-medium">COMPLETED</span>.</li>
                                                        <li>Other vendors will be notified that the tender is closed.</li>
                                                        <li><b>Rejecting</b> will send a notification and PDF report to the vendor.</li>
                                                        <li>The tender remains open for other bids if you reject.</li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
                                                <AnimatedButton
                                                    onClick={handleReject}
                                                    disabled={processing || !comments.trim()}
                                                    className="inline-flex justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    {processing ? (processingStatus || 'Processing...') : 'Reject Bid'}
                                                </AnimatedButton>
                                                <AnimatedButton
                                                    onClick={handleAccept}
                                                    disabled={processing || !comments.trim()}
                                                    className="inline-flex justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    {processing ? (processingStatus || 'Processing...') : 'Accept & Close Tender'}
                                                </AnimatedButton>
                                            </div>
                                        </div>
                                    </section>
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
