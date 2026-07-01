import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { EnergyProvider } from './context/EnergyContext';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ResourceAllocation from './pages/ResourceAllocation';
import Analytics from './pages/Analytics';
import AlertCenter from './pages/AlertCenter';
import CommandCenter from './pages/CommandCenter';

// Shell layout component to isolate routing states
function AppLayout({ children }) {
  const location = useLocation();
  
  // Do not display Navigation sidebar on Landing Page
  const isLandingPage = location.pathname === '/';

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#08090d] text-gray-200">
      <Navigation />
      {/* 80 width sidebar = 20rem (pl-80) */}
      <main className="pl-80 p-8 min-h-screen">
        <div className="max-w-6xl mx-auto py-4">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/allocation" element={<ResourceAllocation />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/alerts" element={<AlertCenter />} />
            <Route path="/command-center" element={<CommandCenter />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <EnergyProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<AppLayout />} />
        </Routes>
      </Router>
    </EnergyProvider>
  );
}
