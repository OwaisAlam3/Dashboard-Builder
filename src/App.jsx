// src/App.jsx
import React, { useEffect } from 'react';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import useDashboardStore from './store/dashboardStore';

function App() {
  const { loadFromLocalStorage } = useDashboardStore();

  useEffect(() => {
    // Load saved dashboard on mount
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  return (
    <div className="w-full h-screen bg-gray-50">
      <DashboardLayout />
    </div>
  );
}

export default App;