import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/common/Layout';
import ProbabilityCalculator from './components/probability/ProbabilityCalculator';
import CalibrationDashboard from './components/calibration/CalibrationDashboard';
import UserSettings from './components/UserSettings';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BankrollPage from './pages/BankrollPage';
import HistoricalDataPage from './pages/HistoricalDataPage';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/probability-calculator"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProbabilityCalculator />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/calibration"
            element={
              <ProtectedRoute>
                <Layout>
                  <CalibrationDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bankroll"
            element={
              <ProtectedRoute>
                <Layout>
                  <BankrollPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <UserSettings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/historical-data"
            element={
              <ProtectedRoute>
                <Layout>
                  <HistoricalDataPage />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;