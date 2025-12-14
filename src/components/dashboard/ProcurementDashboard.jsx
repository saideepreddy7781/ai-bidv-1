// Procurement Officer Dashboard
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllTenders } from '../../services/firebaseService';
import LoadingSpinner from '../shared/LoadingSpinner';
import Navbar from '../layout/Navbar';

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
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Procurement Dashboard
                                </h1>
                                <p className="text-gray-600">Manage tenders and review bid submissions</p>
                            </div>
                            <Link to="/procurement/create-tender" className="btn-primary">
                                Create New Tender
                            </Link>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-gray-500 text-sm">Total Tenders</p>
                            <p className="text-3xl font-bold text-blue-600">{tenders.length}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-gray-500 text-sm">Active Tenders</p>
                            <p className="text-3xl font-bold text-green-600">
                                {tenders.filter(t => t.status === 'OPEN').length}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-gray-500 text-sm">Under Evaluation</p>
                            <p className="text-3xl font-bold text-yellow-600">
                                {tenders.filter(t => t.status === 'EVALUATING').length}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-gray-500 text-sm">Completed</p>
                            <p className="text-3xl font-bold text-gray-600">
                                {tenders.filter(t => t.status === 'COMPLETED').length}
                            </p>
                        </div>
                    </div>

                    {/* Tenders List */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">All Tenders</h2>

                        {tenders.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-4">No tenders created yet</p>
                                <Link to="/procurement/create-tender" className="btn-primary">
                                    Create Your First Tender
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tenders.map((tender) => (
                                    <div key={tender.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-lg text-gray-900">{tender.title}</h3>
                                            <span className={`px-3 py-1 rounded text-sm ${tender.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                                                    tender.status === 'EVALUATING' ? 'bg-yellow-100 text-yellow-800' :
                                                        tender.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-blue-100 text-blue-800'
                                                }`}>
                                                {tender.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tender.description}</p>
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-gray-500">
                                                Deadline: {new Date(tender.deadline?.seconds * 1000).toLocaleDateString()}
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/procurement/tender/${tender.id}`}
                                                    className="btn-secondary text-sm"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
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

export default ProcurementDashboard;
