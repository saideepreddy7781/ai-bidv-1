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


// Landing Page imported from components
import LandingPage from './components/layout/LandingPage';

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
