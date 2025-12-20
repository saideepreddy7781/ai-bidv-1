import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';

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

// Animation Wrapper
import PageTransition from './components/animations/PageTransition';

// Landing Page imported from components
import LandingPage from './components/layout/LandingPage';

// Inner component to use useLocation hook
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

        {/* Vendor Routes */}
        <Route
          path="/vendor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['VENDOR']}>
              <PageTransition>
                <VendorDashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/submit-bid/:tenderId"
          element={
            <ProtectedRoute allowedRoles={['VENDOR']}>
              <PageTransition>
                <SubmitBid />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Procurement Officer Routes */}
        <Route
          path="/procurement/dashboard"
          element={
            <ProtectedRoute allowedRoles={['PROCUREMENT_OFFICER']}>
              <PageTransition>
                <ProcurementDashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/procurement/create-tender"
          element={
            <ProtectedRoute allowedRoles={['PROCUREMENT_OFFICER']}>
              <PageTransition>
                <CreateTender />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/procurement/tender/:tenderId"
          element={
            <ProtectedRoute allowedRoles={['PROCUREMENT_OFFICER', 'EVALUATOR', 'ADMIN']}>
              <PageTransition>
                <TenderDetails />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Evaluator Routes */}
        <Route
          path="/evaluator/dashboard"
          element={
            <ProtectedRoute allowedRoles={['EVALUATOR']}>
              <PageTransition>
                <EvaluatorDashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluator/evaluate/:tenderId"
          element={
            <ProtectedRoute allowedRoles={['EVALUATOR']}>
              <PageTransition>
                <EvaluateBids />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <PageTransition>
                <AdminDashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
