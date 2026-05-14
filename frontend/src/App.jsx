import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import InvestmentsPage from './pages/InvestmentsPage';
import SideBar from './components/SideBar';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { getMe } from './api';

function AppContent() {
  const { isDark } = useTheme();
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

  useEffect(() => {
    const handler = () => {
      setUser(null);
      setPage('dashboard');
    };
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
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
      <div className="ft-page min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#D4A017 transparent #D4A017 transparent' }}></div>
          <p className="text-sm mt-3" style={{ color: isDark ? '#666' : '#475569' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const shared = {
    user,
    onLogout: handleLogout,
    onDashboard: () => setPage('dashboard'),
    onAnalytics: () => setPage('analytics'),
    onInvestments: () => setPage('investments'),
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: isDark ? '#050505' : '#f8fafc' }}>
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
