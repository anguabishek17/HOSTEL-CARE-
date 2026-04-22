import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Sidebar from './components/Sidebar';
import StudentDashboard from './pages/StudentDashboard';
import WardenDashboard from './pages/WardenDashboard';
import StaffDashboard from './pages/StaffDashboard';
import OfficialDashboard from './pages/OfficialDashboard';
import StudentManagement from './pages/StudentManagement';

const App = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 bg-white">Loading...</div>;
  }

  const ProtectedRoute = ({ children, roles }) => {
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
    return children;
  };

  const getDashboard = () => {
    if (!user) return <Navigate to="/login" />;
    switch (user.role) {
      case 'student':  return <StudentDashboard />;
      case 'warden':   return <WardenDashboard />;
      case 'staff':    return <StaffDashboard />;
      case 'official': return <OfficialDashboard />;
      default:         return <Navigate to="/login" />;
    }
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/40">
        {user && <Sidebar />}
        <main className={`flex-1 min-w-0 ${user ? 'p-4 sm:p-6 lg:p-8 sm:ml-64' : ''}`}>
          <Routes>
            <Route path="/login"    element={!user ? <Login />    : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route path="/"         element={getDashboard()} />
            {/* Warden-only: Student Management */}
            <Route
              path="/students"
              element={
                <ProtectedRoute roles={['warden']}>
                  <StudentManagement />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
