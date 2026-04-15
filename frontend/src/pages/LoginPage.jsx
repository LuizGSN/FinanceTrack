import { useState } from 'react';
import { login, register } from '../api';
import Logo from '../components/Logo';

export default function LoginPage({ onLogin, onShowForgot }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        const { token, user } = await register(name, email, password);
        onLogin(token, user);
      } else {
        const { token, user } = await login(email, password);
        onLogin(token, user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] via-[#1a1a1a] to-[#0A0A0A] p-4">
      <div className="w-full max-w-md">
        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={80} />
          </div>
          <h1 className="text-3xl font-bold text-[#D4A017] tracking-wide">FinanceTrack</h1>
          <p className="text-gray-400 mt-2 text-sm">Gerencie suas finanças de forma simples e elegante</p>
        </div>

        {/* Card do formulário */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-[#0A0A0A] text-center mb-6">
            {isRegister ? 'Criar conta' : 'Bem-vindo de volta'}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                required
                minLength="6"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A0A0A] text-[#D4A017] font-semibold p-3 rounded-lg hover:bg-[#1a1a1a] disabled:opacity-50 transition-all border border-[#D4A017] hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Carregando...
                </span>
              ) : isRegister ? 'Criar conta' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              {isRegister ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-[#D4A017] font-semibold hover:underline transition-all"
              >
                {isRegister ? 'Entrar' : 'Criar conta'}
              </button>
            </p>
            {!isRegister && (
              <p className="text-center mt-3">
                <button
                  onClick={onShowForgot}
                  className="text-gray-500 text-sm hover:text-[#D4A017] transition-all"
                >
                  Esqueceu a senha?
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          © 2026 FinanceTrack. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
