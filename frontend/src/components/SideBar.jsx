import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function SideBar({ user, onLogout, currentPage, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { label: 'Dashboard', icon: '📊', page: 'dashboard' },
    { label: 'Análise', icon: '📈', page: 'analytics' },
    { label: 'Investimentos', icon: '💼', page: 'investments' },
    { label: 'Categorias', icon: '🏷️', page: 'categories' },
    { label: 'Configurações', icon: '⚙️', page: 'settings' },
  ];

  const handleNavigate = (page) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <>
      {/* Botão menu mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-600 text-white rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        ≡
      </button>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 md:translate-x-0 z-40 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-2xl">FT</span>
            <div className="text-sm">
              <p className="font-semibold text-gray-900 dark:text-white">FinanceTrack</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">v1.1.0</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.page}
              onClick={() => handleNavigate(item.page)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                currentPage === item.page
                  ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Tema e Usuário */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {/* Tema Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            {isDark ? '☀️ Claro' : '🌙 Escuro'}
          </button>

          {/* Usuário Info */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">Logado como:</p>
            <p className="font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
          >
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
