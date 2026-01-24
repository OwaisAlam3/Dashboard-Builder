import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import DashboardHome from './components/Home/DashboardHome';
import DashboardLoader from './components/Dashboard/DashboardLoader';
import useDashboardStore from './store/dashboardStore';

function App() {
  const initializeApp = useDashboardStore((state) => state.initializeApp);

  useEffect(() => {
    // Initialize app on mount
    initializeApp();
  }, [initializeApp]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/dashboard/:id" element={<DashboardLoader />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;