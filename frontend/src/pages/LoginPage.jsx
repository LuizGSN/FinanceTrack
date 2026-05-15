import { useState } from 'react';
import { login, register } from '../api';
import Logo from '../components/Logo';
import { useTheme } from '../contexts/ThemeContext';

const GOLD = '#D4A017';
const DEMO_EMAIL = 'demo@financetrack.app';
const DEMO_PASSWORD = 'demo123456';

export default function LoginPage({ onLogin }) {
  const { isDark } = useTheme();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        const submittedEmail = email;
        await register(name, email, password);
        setRegisteredEmail(submittedEmail);
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

  function fillDemoCredentials() {
    setIsRegister(false);
    setRegistrationSuccess(false);
    setError('');
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  }

  const muted = isDark ? '#8d887c' : '#64748b';

  if (registrationSuccess) {
    return (
      <div className="ft-page min-h-screen flex items-center justify-center p-4">
        <div className="ft-panel w-full max-w-md rounded-xl p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-green-500/25 bg-green-500/10">
            <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-500">Conta criada</h2>
          <p className="mt-3 text-sm" style={{ color: muted }}>
            Sua conta <span style={{ color: GOLD }}>{registeredEmail}</span> ja pode acessar o FinanceTrack.
          </p>
          <button
            onClick={() => {
              setRegistrationSuccess(false);
              setIsRegister(false);
            }}
            className="ft-button-primary mt-7 w-full rounded-lg py-3 font-semibold"
          >
            Voltar ao login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ft-page min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <div className="mb-5 flex justify-center">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl">
              <Logo size={76} />
            </div>
          </div>
          <p className="ft-kicker">Controle financeiro pessoal</p>
          <h1 className="mt-2 text-4xl font-bold" style={{ color: GOLD }}>FinanceTrack</h1>
          <p className="mt-2 text-sm" style={{ color: muted }}>Organize transacoes, investimentos e indicadores em um painel limpo.</p>
        </div>

        <div className="ft-panel rounded-xl p-7">
          <div className="mb-6 flex rounded-lg border border-white/10 bg-black/20 p-1">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className="flex-1 rounded-md py-2 text-sm font-semibold transition-colors"
              style={{ backgroundColor: !isRegister ? 'rgba(212,160,23,0.16)' : 'transparent', color: !isRegister ? GOLD : muted }}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className="flex-1 rounded-md py-2 text-sm font-semibold transition-colors"
              style={{ backgroundColor: isRegister ? 'rgba(212,160,23,0.16)' : 'transparent', color: isRegister ? GOLD : muted }}
            >
              Criar conta
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: muted }}>Nome</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="ft-input px-4 py-3 text-sm"
                  required
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: muted }}>Email</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ft-input px-4 py-3 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: muted }}>Senha</label>
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ft-input px-4 py-3 text-sm"
                required
                minLength="6"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="ft-button-primary w-full rounded-lg py-3.5 font-semibold disabled:opacity-60"
            >
              {loading ? 'Carregando...' : isRegister ? 'Criar conta' : 'Entrar'}
            </button>
          </form>

          {!isRegister && (
            <div
              className="mt-5 rounded-lg border p-4"
              style={{
                background: 'var(--ft-surface-2)',
                borderColor: 'var(--ft-border)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase" style={{ color: GOLD }}>Acesso demo</p>
                  <p className="mt-1 text-xs" style={{ color: muted }}>Use para testar sem criar uma conta.</p>
                </div>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="ft-button-secondary shrink-0 rounded-md px-3 py-2 text-xs font-semibold"
                >
                  Preencher
                </button>
              </div>
              <div className="mt-3 grid gap-2 text-xs" style={{ color: 'var(--ft-text)' }}>
                <p><strong>Email:</strong> {DEMO_EMAIL}</p>
                <p><strong>Senha:</strong> {DEMO_PASSWORD}</p>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: muted }}>
          (c) 2026 FinanceTrack. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
