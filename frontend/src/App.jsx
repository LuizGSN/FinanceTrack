import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
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
