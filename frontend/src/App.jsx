import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/Auth/LoginPage';
import RegisterPage from './features/Auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ConnectionsPage from './features/Connections/ConnectionsPage';
import VisualizationPage from './features/Visualizations/VisualizationPage';
import ProfilePage from './features/Auth/ProfilePage';
import Layout from './layouts/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a more sophisticated loading spinner
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/connections" element={<PrivateRoute><ConnectionsPage /></PrivateRoute>} />
            <Route path="/visualize/:connectionId?" element={<PrivateRoute><VisualizationPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
