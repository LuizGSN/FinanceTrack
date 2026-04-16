import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo';

export default function SideBar({ user, onLogout, currentPage, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const colors = isDark
    ? {
      panelBg: '#050505',
      panelGradient: 'linear-gradient(180deg, #050505 0%, #0a0a0a 100%)',
      border: '#1a1a1a',
      textMuted: '#555',
      cardBg: 'linear-gradient(135deg, #0a0a0a 0%, #111 100%)',
      buttonBg: '#0a0a0a',
      hoverBg: '#1a1a1a',
      menuHover: '#0f0f0f',
    }
    : {
      panelBg: '#ffffff',
      panelGradient: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      border: '#e2e8f0',
      textMuted: '#64748b',
      cardBg: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      buttonBg: '#f8fafc',
      hoverBg: '#eef2ff',
      menuHover: '#f1f5f9',
    };

  const menuItems = [
    {
      label: 'Transações',
      icon: 'M3 10h18M3 6h18M3 14h18M3 18h18',
      page: 'dashboard',
      description: 'Gerencie receitas e despesas'
    },
    {
      label: 'Análise',
      icon: 'M3 3v18h18M18 9l-6 6-3-3-4 4',
      page: 'analytics',
      description: 'Insights e gráficos detalhados'
    },
    {
      label: 'Investimentos',
      icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
      page: 'investments',
      description: 'Acompanhe seu portfólio'
    },
  ];

  const handleNavigate = (page) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <>
      {/* Botão menu mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg transition-all shadow-lg"
        style={{ backgroundColor: '#D4A017', color: '#0A0A0A' }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-80 flex flex-col z-40 transform transition-transform duration-300 md:translate-x-0 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          backgroundColor: colors.panelBg,
          borderRight: `1px solid ${colors.border}`,
          backgroundImage: colors.panelGradient
        }}
      >
        {/* Logo e Header */}
        <div className="p-6" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <Logo size={56} />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-[#D4A017] to-[#8B6914] rounded-full flex items-center justify-center">
                <span style={{ fontSize: '8px', color: '#0A0A0A', fontWeight: 'bold' }}>✓</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider" style={{ color: '#D4A017' }}>FinanceTrack</h1>
              <p className="text-xs" style={{ color: colors.textMuted }}>v1.3.0</p>
            </div>
          </div>
          {/* Divider decorativo */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #D4A017 0%, transparent 100%)' }}></div>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D4A017' }}></div>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, #D4A017 100%)' }}></div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-3" style={{ color: colors.textMuted }}>Menu Principal</p>
          {menuItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => handleNavigate(item.page)}
                className="w-full text-left px-4 py-3.5 rounded-xl flex items-start gap-3 transition-all duration-300 group"
                style={{
                  background: isActive ? (isDark ? 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)' : 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)') : 'transparent',
                  border: isActive ? '1px solid rgba(212, 160, 23, 0.3)' : '1px solid transparent',
                  boxShadow: isActive ? '0 4px 12px rgba(212, 160, 23, 0.1)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = colors.menuHover;
                    e.currentTarget.style.borderColor = 'rgba(212, 160, 23, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                {/* Icon container */}
                <div
                  className="p-2.5 rounded-lg transition-all duration-300 flex-shrink-0"
                  style={{
                    backgroundColor: isActive ? 'rgba(212, 160, 23, 0.15)' : colors.buttonBg,
                    border: isActive ? '1px solid rgba(212, 160, 23, 0.3)' : `1px solid ${colors.border}`,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isActive ? '#D4A017' : (isDark ? '#666' : '#475569')}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {item.icon}
                  </svg>
                </div>
                {/* Text content */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold transition-colors duration-300"
                    style={{ color: isActive ? '#D4A017' : (isDark ? '#999' : '#334155') }}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{item.description}</p>
                </div>
                {/* Active indicator */}
                {isActive && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D4A017', boxShadow: '0 0 8px rgba(212, 160, 23, 0.6)' }}></div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer: Tema + Usuário + Logout */}
        <div className="p-4 space-y-4" style={{ borderTop: `1px solid ${colors.border}` }}>
          {/* Usuário Info */}
          <div className="p-4 rounded-xl" style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
          }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                style={{
                  background: 'linear-gradient(135deg, #D4A017 0%, #8B6914 100%)',
                  color: '#0A0A0A'
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs" style={{ color: colors.textMuted }}>Logado como</p>
                <p className="font-semibold text-sm truncate" style={{ color: '#D4A017' }}>{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22c55e', boxShadow: '0 0 6px rgba(34, 197, 94, 0.4)' }}></div>
              <span className="text-xs" style={{ color: colors.textMuted }}>Online</span>
            </div>
          </div>

          {/* Tema Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
            style={{
              backgroundColor: colors.buttonBg,
              color: isDark ? '#999' : '#334155',
              border: `1px solid ${colors.border}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.hoverBg;
              e.currentTarget.style.borderColor = 'rgba(212, 160, 23, 0.3)';
              e.currentTarget.style.color = '#D4A017';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.buttonBg;
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.color = isDark ? '#999' : '#334155';
            }}
          >
            {isDark ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                Mudar para Claro
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                Mudar para Escuro
              </>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg, #1a0a0a 0%, #0f0505 100%)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #2a0a0a 0%, #1a0505 100%)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #1a0a0a 0%, #0f0505 100%)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sair da Conta
          </button>
        </div>
      </aside>
    </>
  );
}
