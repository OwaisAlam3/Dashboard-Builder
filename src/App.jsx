import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import DashboardHome from './components/Home/DashboardHome';
import DashboardLayout from './components/Dashboard/DashboardLayout';

function AppRoutes() {
  const navigate = useNavigate(); // ✅ hook at top level ONLY

  function onOpenDashboard(id) {
    navigate(`/dashboard/${id}`); // ✅ normal function call
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<DashboardHome onOpenDashboard={onOpenDashboard} />}
      />
      <Route path="/dashboard/:id" element={<DashboardLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}


