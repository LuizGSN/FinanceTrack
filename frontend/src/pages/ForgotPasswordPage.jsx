import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { sendForgotPassword } from '../api';

const GOLD = '#D4A017';
const DARK_BG = '#050505';
const CARD_BG = '#0a0a0a';
const CARD_BORDER = '#1a1a1a';

export default function ForgotPasswordPage({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Por favor, insira seu e-mail');
      return;
    }

    try {
      setLoading(true);
      await sendForgotPassword(email);
      setMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Erro ao enviar e-mail de recuperação');
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
              <Mail className="w-8 h-8" style={{ color: '#0A0A0A' }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: GOLD }}>Esqueceu sua senha?</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Digite seu e-mail para receber instruções de recuperação
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
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#999' }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-lg text-sm transition-all"
                style={{
                  backgroundColor: '#111',
                  color: '#e5e5e5',
                  border: '1px solid #2a2a2a',
                  outline: 'none',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = GOLD}
                onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
                disabled={loading}
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
                  Enviando...
                </span>
              ) : 'Enviar E-mail de Recuperação'}
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
