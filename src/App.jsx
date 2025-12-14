import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Authentication
import Login from './components/authentication/Login';
import Register from './components/authentication/Register';
import ProtectedRoute from './components/authentication/ProtectedRoute';

// Dashboards
import VendorDashboard from './components/dashboard/VendorDashboard';
import ProcurementDashboard from './components/dashboard/ProcurementDashboard';
import EvaluatorDashboard from './components/dashboard/EvaluatorDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';

// Tender & Bid Components
import CreateTender from './components/admin/CreateTender';
import TenderDetails from './components/admin/TenderDetails';
import SubmitBid from './components/bid-submission/SubmitBid';
import EvaluateBids from './components/evaluation/EvaluateBids';


// Landing Page - Neobrutalism Style
const LandingPage = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#F5F5F5' }}>
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="hero bg-white mb-12 text-center">
        <h1 className="text-5xl md:text-7xl font-black mb-6">
          <span className="text-blue-500" style={{ color: '#4285F4' }}>AI</span>
          <span className="text-red-500 mx-2" style={{ color: '#EA4335' }}>BID</span>
          <span className="text-yellow-400" style={{ color: '#FBBC04' }}>EVALUATION</span>
        </h1>
        <p className="text-xl md:text-2xl font-bold text-black mb-8 max-w-3xl mx-auto">
          STREAMLINE GOVERNMENT PROCUREMENT WITH INTELLIGENT DOCUMENT ANALYSIS & AI-DRIVEN INSIGHTS
        </p>
        <div className="flex gap-6 justify-center flex-wrap">
          <a href="/login" className="btn-primary text-lg">
            LOGIN NOW
          </a>
          <a href="/register" className="btn-success text-lg">
            GET STARTED
          </a>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card-hover bg-blue-500 text-white" style={{ backgroundColor: '#4285F4' }}>
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="font-black text-2xl mb-3 uppercase">AI Analysis</h3>
          <p className="font-semibold">
            Automatic document processing powered by advanced AI technology
          </p>
        </div>
        <div className="card-hover bg-yellow-400 text-black" style={{ backgroundColor: '#FBBC04' }}>
          <div className="text-6xl mb-4">✅</div>
          <h3 className="font-black text-2xl mb-3 uppercase">Compliance Check</h3>
          <p className="font-semibold">
            Instant verification against all tender requirements
          </p>
        </div>
        <div className="card-hover bg-green-500 text-white" style={{ backgroundColor: '#34A853' }}>
          <div className="text-6xl mb-4">📊</div>
          <h3 className="font-black text-2xl mb-3 uppercase">Smart Comparison</h3>
          <p className="font-semibold">
            AI-powered bid ranking and comparative analysis
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-12 card text-center bg-red-500 text-white" style={{ backgroundColor: '#EA4335' }}>
        <h2 className="text-3xl font-black mb-4 uppercase">Ready to Transform Your Procurement?</h2>
        <p className="text-lg font-bold mb-6">Join the future of government bid evaluation today!</p>
        <a href="/register" className="bg-black text-white font-bold py-4 px-8 border-4 border-white shadow-[6px_6px_0px_0px_#FFFFFF] hover:shadow-[3px_3px_0px_0px_#FFFFFF] hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-100 inline-block">
          START FREE TRIAL
        </a>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Vendor Routes */}
          <Route
            path="/vendor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['VENDOR']}>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/submit-bid/:tenderId"
            element={
              <ProtectedRoute allowedRoles={['VENDOR']}>
                <SubmitBid />
              </ProtectedRoute>
            }
          />

          {/* Procurement Officer Routes */}
          <Route
            path="/procurement/dashboard"
            element={
              <ProtectedRoute allowedRoles={['PROCUREMENT_OFFICER']}>
                <ProcurementDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/procurement/create-tender"
            element={
              <ProtectedRoute allowedRoles={['PROCUREMENT_OFFICER']}>
                <CreateTender />
              </ProtectedRoute>
            }
          />
          <Route
            path="/procurement/tender/:tenderId"
            element={
              <ProtectedRoute allowedRoles={['PROCUREMENT_OFFICER', 'EVALUATOR', 'ADMIN']}>
                <TenderDetails />
              </ProtectedRoute>
            }
          />

          {/* Evaluator Routes */}
          <Route
            path="/evaluator/dashboard"
            element={
              <ProtectedRoute allowedRoles={['EVALUATOR']}>
                <EvaluatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/evaluator/evaluate/:tenderId"
            element={
              <ProtectedRoute allowedRoles={['EVALUATOR']}>
                <EvaluateBids />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
