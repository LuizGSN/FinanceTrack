import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import InvestmentsPage from './pages/InvestmentsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SideBar from './components/SideBar';
import { ThemeProvider } from './contexts/ThemeContext';
import { getMe } from './api';

function AppContent() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then((userData) => {
          setUser(userData);
          setAuthLoading(false);
        })
        .catch(() => {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
      </div>
    );
  }

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const shared = {
    user,
    onLogout: handleLogout,
    onDashboard: () => setPage('dashboard'),
    onAnalytics: () => setPage('analytics'),
    onInvestments: () => setPage('investments'),
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      <SideBar 
        currentPage={page}
        onNavigate={setPage}
        user={user}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto">
        {page === 'dashboard' && <Dashboard {...shared} />}
        {page === 'analytics' && <AnalyticsPage {...shared} />}
        {page === 'investments' && <InvestmentsPage {...shared} />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
