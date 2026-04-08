import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import { getMe } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token with backend on page reload
      getMe()
        .then((userData) => {
          setUser(userData);
          setAuthLoading(false);
        })
        .catch(() => {
          // Token expired or invalid — clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setAuthLoading(false);
        });
    } else {
      setAuthLoading(false);
    }
  }, []);

  function handleLogin(token, userData) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setPage('dashboard');
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPage('dashboard');
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const shared = {
    user,
    onLogout: handleLogout,
    onDashboard: () => setPage('dashboard'),
    onAnalytics: () => setPage('analytics'),
  };

  if (page === 'analytics') {
    return <AnalyticsPage {...shared} />;
  }

  return <Dashboard {...shared} />;
}
