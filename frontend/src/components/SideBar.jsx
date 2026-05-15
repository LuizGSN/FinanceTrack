import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo';
import ChangePasswordModal from './ChangePasswordModal';

const menuItems = [
  {
    label: 'Transacoes',
    page: 'dashboard',
    icon: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h10" /></>,
  },
  {
    label: 'Analises',
    page: 'analytics',
    icon: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 15l3-4 3 2 4-6" /></>,
  },
  {
    label: 'Investimentos',
    page: 'investments',
    icon: <><path d="M12 3v18" /><path d="M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></>,
  },
];

function NavIcon({ children }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export default function SideBar({ user, onLogout, currentPage, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const handleNavigate = (page) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="ft-button-secondary md:hidden fixed top-4 left-4 z-50 h-10 w-10 rounded-lg inline-flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir menu"
      >
        <NavIcon>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </NavIcon>
      </button>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`ft-sidebar fixed md:sticky top-0 left-0 h-screen w-72 flex flex-col z-40 transform transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-20 px-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--ft-border)' }}>
          <Logo size={38} />
          <div>
            <h1 className="text-base font-semibold" style={{ color: 'var(--ft-text)' }}>FinanceTrack</h1>
            <p className="text-xs" style={{ color: 'var(--ft-muted)' }}>Portfolio app</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {menuItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => handleNavigate(item.page)}
                className={`ft-nav-item ${isActive ? 'ft-nav-item-active' : ''} w-full rounded-lg px-3 py-2.5 flex items-center gap-3 text-sm font-medium`}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md" style={{ background: isActive ? 'var(--ft-gold-soft)' : 'transparent', color: isActive ? 'var(--ft-gold)' : 'currentColor' }}>
                  <NavIcon>{item.icon}</NavIcon>
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 space-y-2" style={{ borderTop: '1px solid var(--ft-border)' }}>
          <div className="rounded-lg px-3 py-3" style={{ background: 'var(--ft-surface-2)' }}>
            <p className="text-xs" style={{ color: 'var(--ft-muted)' }}>Logado como</p>
            <p className="truncate text-sm font-semibold" style={{ color: 'var(--ft-text)' }}>{user?.name}</p>
          </div>

          <button
            onClick={toggleTheme}
            className="ft-button-secondary w-full rounded-lg px-3 py-2.5 flex items-center justify-between text-sm"
          >
            <span>{isDark ? 'Tema claro' : 'Tema escuro'}</span>
            <NavIcon>
              {isDark ? <circle cx="12" cy="12" r="5" /> : <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" />}
            </NavIcon>
          </button>

          <button
            onClick={() => setShowChangePassword(true)}
            className="ft-button-secondary w-full rounded-lg px-3 py-2.5 flex items-center justify-between text-sm"
          >
            <span>Alterar senha</span>
            <NavIcon>
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V8a5 5 0 0110 0v3" />
            </NavIcon>
          </button>

          <button
            onClick={onLogout}
            className="w-full rounded-lg px-3 py-2.5 flex items-center justify-between text-sm"
            style={{ color: 'var(--ft-red)', border: '1px solid rgba(239, 68, 68, 0.24)', background: 'transparent' }}
          >
            <span>Sair</span>
            <NavIcon>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </NavIcon>
          </button>
        </div>
      </aside>

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </>
  );
}
