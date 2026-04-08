import Logo from './Logo';

export default function Header({ user, onLogout, onDashboard, onAnalytics, active }) {
  return (
    <header className="bg-[#0A0A0A] shadow sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* Linha principal */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <h1 className="text-lg font-bold text-white tracking-wide">
              FinanceTrack
            </h1>
            <span className="text-gray-600">|</span>
            <span className="text-[#D4A017] text-sm">
              Olá, {user.name}!
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={onDashboard}
              className={`px-2 py-1 rounded transition-colors ${
                active === 'dashboard'
                  ? 'text-[#D4A017] font-medium'
                  : 'text-gray-300 hover:text-[#D4A017]'
              }`}
            >
              Transações
            </button>
            <button
              onClick={onAnalytics}
              className={`px-2 py-1 rounded transition-colors ${
                active === 'analytics'
                  ? 'text-[#D4A017] font-medium'
                  : 'text-gray-300 hover:text-[#D4A017]'
              }`}
            >
              Analytics
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={onLogout}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
