import { useState } from 'react';
import { login, register } from '../api';
import Logo from '../components/Logo';
import { useTheme } from '../contexts/ThemeContext';

const GOLD = '#D4A017';
const DARK_BG = '#050505';
const CARD_BG = '#0a0a0a';
const CARD_BORDER = '#1a1a1a';

export default function LoginPage({ onLogin, onShowForgot }) {
  const { isDark } = useTheme();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const background = isDark
    ? `linear-gradient(135deg, ${DARK_BG} 0%, #1a1a1a 50%, ${DARK_BG} 100%)`
    : 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)';
  const cardBg = isDark ? CARD_BG : '#ffffff';
  const cardBorder = isDark ? CARD_BORDER : '#e2e8f0';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        setRegisteredEmail(email);
        await register(name, email, password);
        setRegistrationSuccess(true);
        setName('');
        setEmail('');
        setPassword('');
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

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background,
      }}>
        <div className="w-full max-w-md">
          <div className="rounded-2xl p-8 shadow-2xl" style={{
            backgroundColor: cardBg,
            border: `1px solid ${cardBorder}`,
          }}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{
                background: `linear-gradient(135deg, #22c55e 0%, #16a34a 100%)`,
              }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#22c55e' }}>
                Conta Criada com Sucesso!
              </h2>
              <p className="text-gray-400 mb-6 text-sm">
                Um email de confirmação foi enviado para <span style={{ color: GOLD }}>{email}</span>
              </p>
              <div className="p-4 rounded-lg mb-6" style={{
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}>
                <p style={{ color: '#22c55e', fontSize: '14px', marginBottom: '8px' }}>
                  ✓ Cadastro concluído
                </p>
                <p style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>
                  Você pode voltar para o login e entrar imediatamente.
                </p>
              </div>
              <button
                onClick={() => setRegistrationSuccess(false)}
                className="w-full font-semibold py-3 rounded-lg transition-all"
                style={{
                  background: `linear-gradient(135deg, ${GOLD} 0%, #b8860b 100%)`,
                  color: '#0A0A0A',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, #f5c542 0%, #d4a017 100%)`;
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 160, 23, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${GOLD} 0%, #b8860b 100%)`;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Voltar ao Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background,
    }}>
      <div className="w-full max-w-md">
        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Logo size={100} />
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 rounded-full" style={{
                background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
              }}></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-wider" style={{ color: GOLD }}>FinanceTrack</h1>
          <p className="text-gray-500 mt-2 text-sm">Gerencie suas finanças com elegância</p>
        </div>

        {/* Card do formulário */}
        <div className="rounded-2xl p-8 shadow-2xl" style={{
          backgroundColor: cardBg,
          border: `1px solid ${cardBorder}`,
        }}>
          <h2 className="text-2xl font-bold text-center mb-6" style={{ color: GOLD }}>
            {isRegister ? 'Criar conta' : 'Bem-vindo'}
          </h2>

          {error && (
            <div className="p-3 rounded-lg mb-4 text-sm" style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#999' }}>Nome</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg transition-all text-sm"
                  style={{
                    backgroundColor: '#111',
                    color: '#e5e5e5',
                    border: '1px solid #2a2a2a',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = GOLD}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#999' }}>Email</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg transition-all text-sm"
                style={{
                  backgroundColor: '#111',
                  color: '#e5e5e5',
                  border: '1px solid #2a2a2a',
                  outline: 'none',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = GOLD}
                onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#999' }}>Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg transition-all text-sm"
                style={{
                  backgroundColor: '#111',
                  color: '#e5e5e5',
                  border: '1px solid #2a2a2a',
                  outline: 'none',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = GOLD}
                onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
                required
                minLength="6"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-3.5 rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, #b8860b 100%)`,
                color: '#0A0A0A',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, #f5c542 0%, #d4a017 100%)`;
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 160, 23, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${GOLD} 0%, #b8860b 100%)`;
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 160, 23, 0.2)';
              }}
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

          <div className="mt-6 pt-6 border-t" style={{ borderColor: CARD_BORDER }}>
            <p className="text-center text-sm" style={{ color: '#666' }}>
              {isRegister ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="font-semibold transition-colors"
                style={{ color: GOLD }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f5c542'}
                onMouseLeave={(e) => e.currentTarget.style.color = GOLD}
              >
                {isRegister ? 'Entrar' : 'Criar conta'}
              </button>
            </p>
            {!isRegister && (
              <p className="text-center mt-3">
                <button
                  onClick={onShowForgot}
                  className="text-sm transition-colors"
                  style={{ color: '#666' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = GOLD}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                >
                  Esqueceu a senha?
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6">
          © 2026 FinanceTrack. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
