// Procurement Officer Dashboard - Professional Style
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllTenders } from '../../services/firebaseService';
import LoadingSpinner from '../shared/LoadingSpinner';
import Navbar from '../layout/Navbar';

// Animation Components
import AnimatedCard from '../animations/AnimatedCard';
import StaggerContainer, { StaggerLi, StaggerItem } from '../animations/StaggerContainer';
import AnimatedButton from '../animations/AnimatedButton';

const ProcurementDashboard = () => {
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTenders = async () => {
            try {
                const data = await getAllTenders();
                setTenders(data);
            } catch (error) {
                console.error('Error fetching tenders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTenders();
    }, []);

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
                    <div className="md:flex md:items-center md:justify-between mb-8">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                                Procurement Dashboard
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Manage tenders and review bid submissions
                            </p>
                        </div>
                        <div className="mt-4 flex md:ml-4 md:mt-0">
                            <Link to="/procurement/create-tender">
                                <AnimatedButton className="btn-primary">
                                    <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Create New Tender
                                </AnimatedButton>
                            </Link>
                        </div>
                    </div>

                    {/* Stats */}
                    <StaggerContainer className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        <StaggerItem>
                            <AnimatedCard className="card bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200 p-5">
                                <dt className="text-sm font-medium text-slate-500 truncate">Total Tenders</dt>
                                <dd className="mt-1 text-3xl font-semibold text-slate-900">{tenders.length}</dd>
                            </AnimatedCard>
                        </StaggerItem>
                        <StaggerItem>
                            <AnimatedCard className="card bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200 p-5">
                                <dt className="text-sm font-medium text-slate-500 truncate">Active Tenders</dt>
                                <dd className="mt-1 text-3xl font-semibold text-emerald-600">
                                    {tenders.filter(t => t.status === 'OPEN').length}
                                </dd>
                            </AnimatedCard>
                        </StaggerItem>
                        <StaggerItem>
                            <AnimatedCard className="card bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200 p-5">
                                <dt className="text-sm font-medium text-slate-500 truncate">Under Evaluation</dt>
                                <dd className="mt-1 text-3xl font-semibold text-amber-600">
                                    {tenders.filter(t => t.status === 'EVALUATING').length}
                                </dd>
                            </AnimatedCard>
                        </StaggerItem>
                        <StaggerItem>
                            <AnimatedCard className="card bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200 p-5">
                                <dt className="text-sm font-medium text-slate-500 truncate">Completed</dt>
                                <dd className="mt-1 text-3xl font-semibold text-blue-600">
                                    {tenders.filter(t => t.status === 'COMPLETED').length}
                                </dd>
                            </AnimatedCard>
                        </StaggerItem>
                    </StaggerContainer>

                    {/* Tenders List */}
                    <div className="bg-white shadow-sm ring-1 ring-slate-900/5 sm:rounded-xl overflow-hidden">
                        <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
                            <h3 className="text-base font-semibold leading-6 text-slate-900">All Tenders</h3>
                        </div>

                        {tenders.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                </svg>
                                <p className="mt-2 text-sm font-medium text-slate-900">No tenders created yet</p>
                                <p className="mt-1 text-sm text-slate-500">Get started by creating a new tender.</p>
                                <div className="mt-6">
                                    <Link to="/procurement/create-tender">
                                        <AnimatedButton className="btn-primary">
                                            <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                            Create Tender
                                        </AnimatedButton>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <StaggerContainer as="ul" className="divide-y divide-slate-100">
                                {tenders.map((tender) => (
                                    <StaggerLi key={tender.id} className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-slate-50 sm:px-6 transition-colors">
                                        <div className="flex min-w-0 gap-x-4">
                                            <div className="min-w-0 flex-auto">
                                                <p className="text-sm font-semibold leading-6 text-slate-900">
                                                    <Link to={`/procurement/tender/${tender.id}`}>
                                                        <span className="absolute inset-x-0 -top-px bottom-0" />
                                                        {tender.title}
                                                    </Link>
                                                </p>
                                                <p className="mt-1 flex text-xs leading-5 text-slate-500 truncate max-w-md">
                                                    {tender.description}
                                                </p>
                                                <div className="mt-2 flex items-center gap-x-2 text-xs leading-5 text-slate-500">
                                                    <p>Deadline: {new Date(tender.deadline?.seconds * 1000).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-x-4">
                                            <div className="hidden sm:flex sm:flex-col sm:items-end">
                                                {getStatusBadge(tender.status)}
                                            </div>
                                            <svg className="h-5 w-5 flex-none text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </StaggerLi>
                                ))}
                            </StaggerContainer>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProcurementDashboard;
