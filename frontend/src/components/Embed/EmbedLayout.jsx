import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Loader2, Lock } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import GridCanvas from '../Dashboard/GridCanvas';

const EmbedLayout = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const { loadDashboard, currentDashboardId, widgets } = useDashboardStore();

  const dashboardId = searchParams.get('id');
  const token = searchParams.get('token');

  useEffect(() => {
    const initializeEmbed = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!dashboardId) {
          throw new Error('Dashboard ID is required');
        }

        let authenticated = false;

        if (token) {
          const isValid = await validateEmbedToken(dashboardId, token);
          if (isValid) {
            authenticated = true;
          }
        }

        if (!authenticated) {
          const isPublic = await checkDashboardPublic(dashboardId);
          if (isPublic) {
            authenticated = true;
          }
        }

        if (!authenticated) {
          throw new Error('This dashboard requires authentication');
        }

        setIsAuthenticated(true);
        await loadDashboard(dashboardId, token);
        setLoading(false);
      } catch (err) {
        console.error('Embed initialization error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initializeEmbed();
  }, [dashboardId, token]);

  const validateEmbedToken = async (id, embedToken) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${API_URL}/embed/validate-token`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Embed-Token': embedToken
        },
        body: JSON.stringify({ token: embedToken, dashboardId: id })
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.valid === true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  const checkDashboardPublic = async (id) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${API_URL}/embed/dashboard/${id}/public-status`);
      
      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.isPublic === true;
    } catch (error) {
      console.error('Public status check error:', error);
      return false;
    }
  };

  useEffect(() => {
    if (currentDashboardId && widgets && !loading) {
      window.parent.postMessage({
        type: 'dashboard-loaded',
        dashboardId: currentDashboardId,
        widgetCount: widgets.length,
        timestamp: Date.now()
      }, '*');
    }
  }, [currentDashboardId, widgets, loading]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-gray-900 text-lg font-semibold mb-2">Unable to Load Dashboard</h3>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          {!token && (
            <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
              <Lock size={12} />
              <span>This dashboard requires authentication</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white">
      <GridCanvas embedMode={true} readOnly={true} />
    </div>
  );
};

export default EmbedLayout;