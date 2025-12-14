// Procurement Officer Dashboard - Neobrutalism Style
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
            <div className="page-brutal">
                <div className="container-brutal">
                    {/* Header */}
                    <div className="card mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-black text-black mb-2 uppercase tracking-tight">
                                    Procurement Dashboard
                                </h1>
                                <p className="text-black font-bold">Manage tenders and review bid submissions</p>
                            </div>
                            <Link to="/procurement/create-tender" className="btn-primary">
                                CREATE NEW TENDER
                            </Link>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="stat-card-blue">
                            <p className="text-sm font-bold mb-2 uppercase">Total Tenders</p>
                            <p className="text-5xl font-black">{tenders.length}</p>
                        </div>
                        <div className="stat-card-green">
                            <p className="text-sm font-bold mb-2 uppercase">Active Tenders</p>
                            <p className="text-5xl font-black">
                                {tenders.filter(t => t.status === 'OPEN').length}
                            </p>
                        </div>
                        <div className="stat-card-yellow">
                            <p className="text-sm font-bold mb-2 uppercase">Under Evaluation</p>
                            <p className="text-5xl font-black">
                                {tenders.filter(t => t.status === 'EVALUATING').length}
                            </p>
                        </div>
                        <div className="stat-card">
                            <p className="text-sm font-bold mb-2 uppercase">Completed</p>
                            <p className="text-5xl font-black">
                                {tenders.filter(t => t.status === 'COMPLETED').length}
                            </p>
                        </div>
                    </div>

                    {/* Tenders List */}
                    <div className="card">
                        <h2 className="text-3xl font-black text-black mb-6 uppercase">All Tenders</h2>

                        {tenders.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-black font-bold mb-6">No tenders created yet</p>
                                <Link to="/procurement/create-tender" className="btn-primary">
                                    CREATE YOUR FIRST TENDER
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tenders.map((tender) => (
                                    <div key={tender.id} className="border-4 border-black p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-black text-2xl text-black">{tender.title}</h3>
                                            <span className={`px-4 py-2 border-4 border-black font-bold uppercase ${tender.status === 'OPEN' ? 'bg-google-green text-white' :
                                                    tender.status === 'EVALUATING' ? 'bg-google-yellow text-black' :
                                                        tender.status === 'CLOSED' ? 'bg-gray-400 text-white' :
                                                            'bg-google-blue text-white'
                                                }`}>
                                                {tender.status}
                                            </span>
                                        </div>
                                        <p className="text-black font-semibold mb-4 line-clamp-2">{tender.description}</p>
                                        <div className="flex justify-between items-center">
                                            <div className="font-bold text-black">
                                                Deadline: {new Date(tender.deadline?.seconds * 1000).toLocaleDateString()}
                                            </div>
                                            <div className="flex gap-3">
                                                <Link
                                                    to={`/procurement/tender/${tender.id}`}
                                                    className="btn-secondary"
                                                >
                                                    VIEW DETAILS
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
