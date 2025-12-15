import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import CreateQuote from './components/CreateQuote';
import ViewQuote from './components/ViewQuote';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { isAuthenticated } from './services/authService';

// Global Fade Animation
const GlobalStyles = () => (
  <style>{`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.4s ease-out forwards;
    }
  `}</style>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <>
      <GlobalStyles />
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/new" element={
              <ProtectedRoute>
                <CreateQuote />
              </ProtectedRoute>
            } />

            {/* Public Routes (with internal PasswordGate) */}
            <Route path="/view/:id" element={<ViewQuote />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </>
  );
};

export default App;