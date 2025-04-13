import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/member/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

function PrivateRoute({ children, requiredRole = null }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and user doesn't have it
  if (requiredRole && user.role !== requiredRole) {
    return user.role === 'admin'
      ? <Navigate to="/admin/dashboard" replace />
      : <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    setIsAuthenticated(!!token);
    setUserRole(user.role || null);
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              userRole === 'admin' ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <LoginPage />
            )
          }
        />

        {/* Member routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute requiredRole="member">
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute requiredRole="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Fallback route */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? (userRole === 'admin' ? '/admin/dashboard' : '/dashboard') : '/login'} replace />}
        />

        {/* Catch all other routes */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? (userRole === 'admin' ? '/admin/dashboard' : '/dashboard') : '/login'} replace />}
        />
      </Routes>
    </Router>
  );
}