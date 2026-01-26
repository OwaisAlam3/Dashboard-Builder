// src/components/Dashboard/DashboardLoader.jsx - PRODUCTION READY: No infinite loops
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import DashboardLayout from './DashboardLayout';

const DashboardLoader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loadDashboard, currentDashboardId } = useDashboardStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadAttempted, setLoadAttempted] = useState(false);

  useEffect(() => {
    const initDashboard = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      // Skip if already loaded and no reload needed
      if (currentDashboardId === id && loadAttempted) {
        setLoading(false);
        return;
      }

      // Prevent multiple loads
      if (loadAttempted && currentDashboardId === id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setLoadAttempted(true);

      try {
        await loadDashboard(id);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError(err.message || 'Failed to load dashboard');
        setLoading(false);
      }
    };

    initDashboard();
  }, [id]); // Only depend on id, not currentDashboardId to prevent loops

  if (loading) {
    return (
      <div className="h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-accent-blue" size={48} />
          <p className="text-lg text-white/60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
          <p className="text-lg text-white mb-2">Failed to load dashboard</p>
          <p className="text-sm text-white/40 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-accent-blue hover:bg-accent-blue/80 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return <DashboardLayout />;
};

export default DashboardLoader;