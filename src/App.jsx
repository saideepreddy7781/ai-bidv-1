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

// Landing Page
const LandingPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center px-4">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
        AI-Powered Bid Evaluation Platform
      </h1>
      <p className="text-xl text-blue-100 mb-8">
        Streamline government procurement with intelligent document analysis,
        automated compliance checking, and AI-driven insights
      </p>
      <div className="flex gap-4 justify-center">
        <a href="/login" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
          Login
        </a>
        <a href="/register" className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors border-2 border-white">
          Get Started
        </a>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="text-3xl mb-3">🤖</div>
          <h3 className="font-semibold text-lg mb-2">AI Analysis</h3>
          <p className="text-blue-100 text-sm">
            Automatic document processing with Google Gemini API
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="text-3xl mb-3">✅</div>
          <h3 className="font-semibold text-lg mb-2">Compliance Check</h3>
          <p className="text-blue-100 text-sm">
            Instant verification against tender requirements
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="font-semibold text-lg mb-2">Smart Comparison</h3>
          <p className="text-blue-100 text-sm">
            AI-powered bid ranking and comparative analysis
          </p>
        </div>
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
