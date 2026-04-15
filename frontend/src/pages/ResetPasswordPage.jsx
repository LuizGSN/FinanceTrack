import { useState } from 'react';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';

const GOLD = '#D4A017';
const DARK_BG = '#050505';
const CARD_BG = '#0a0a0a';
const CARD_BORDER = '#1a1a1a';

export default function ResetPasswordPage({ token, onBackToLogin, onSuccess }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { request } = useFetch();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!password || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      setLoading(true);
      await request('/api/v1/auth/reset-password', 'POST', {
        token,
        newPassword: password,
      });
      setMessage('Senha redefinida com sucesso! Redirecionando...');
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Erro ao redefinir senha. O token pode ter expirado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: `linear-gradient(135deg, ${DARK_BG} 0%, #1a1a1a 50%, ${DARK_BG} 100%)`,
    }}>
      <div className="w-full max-w-md">
        <div className="rounded-2xl p-8 shadow-2xl" style={{
          backgroundColor: CARD_BG,
          border: `1px solid ${CARD_BORDER}`,
        }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{
              background: `linear-gradient(135deg, ${GOLD} 0%, #b8860b 100%)`,
            }}>
              <Lock className="w-8 h-8" style={{ color: '#0A0A0A' }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: GOLD }}>Redefinir Senha</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Digite sua nova senha abaixo
            </p>
          </div>

          {/* Messages */}
          {message && (
            <div className="p-4 rounded-lg mb-6 text-sm" style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              color: '#22c55e',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}>
              {message}
            </div>
          )}
          {error && (
            <div className="p-4 rounded-lg mb-6 text-sm" style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#999' }}>
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-4 py-3 rounded-lg text-sm transition-all"
                  style={{
                    backgroundColor: '#111',
                    color: '#e5e5e5',
                    border: '1px solid #2a2a2a',
                    outline: 'none',
                    paddingRight: '48px',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = GOLD}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 transition-colors"
                  style={{ color: '#666' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = GOLD}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#999' }}>
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-4 py-3 rounded-lg text-sm transition-all"
                  style={{
                    backgroundColor: '#111',
                    color: '#e5e5e5',
                    border: '1px solid #2a2a2a',
                    outline: 'none',
                    paddingRight: '48px',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = GOLD}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 transition-colors"
                  style={{ color: '#666' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = GOLD}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
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
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </form>

          {/* Back Link */}
          <button
            onClick={onBackToLogin}
            className="mt-6 w-full flex items-center justify-center gap-2 font-medium transition-colors py-3"
            style={{ color: '#666' }}
            onMouseEnter={(e) => e.currentTarget.style.color = GOLD}
            onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
          >
            <ArrowLeft size={18} />
            Voltar ao Login
          </button>
        </div>
      </div>
    </div>
  );
}
