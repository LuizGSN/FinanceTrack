import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { confirmEmail as confirmEmailApi } from '../api';

const GOLD = '#D4A017';
const DARK_BG = '#050505';
const CARD_BG = '#0a0a0a';
const CARD_BORDER = '#1a1a1a';

export default function ConfirmEmailPage({ token, onBackToLogin }) {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let redirectTimer = null;
    if (!token) {
      setError('Token não fornecido');
      setLoading(false);
      return undefined;
    }

    const confirmEmail = async () => {
      try {
        await confirmEmailApi(token);
        setSuccess(true);
        setLoading(false);
        // Auto-redirect após 3 segundos
        redirectTimer = setTimeout(() => {
          onBackToLogin();
        }, 3000);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    confirmEmail();
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [token, onBackToLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: `linear-gradient(135deg, ${DARK_BG} 0%, #1a1a1a 50%, ${DARK_BG} 100%)`,
    }}>
      <div className="w-full max-w-md">
        <div className="rounded-2xl p-8 shadow-2xl" style={{
          backgroundColor: CARD_BG,
          border: `1px solid ${CARD_BORDER}`,
        }}>
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {loading && (
              <div className="w-16 h-16 rounded-full flex items-center justify-center animate-spin" style={{
                borderColor: `${GOLD} transparent ${GOLD} transparent`,
                borderStyle: 'solid',
                borderWidth: '3px',
              }}>
              </div>
            )}
            {success && (
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{
                background: `linear-gradient(135deg, #22c55e 0%, #16a34a 100%)`,
              }}>
                <CheckCircle className="w-8 h-8" style={{ color: '#fff' }} />
              </div>
            )}
            {error && !loading && (
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{
                background: `linear-gradient(135deg, #ef4444 0%, #dc2626 100%)`,
              }}>
                <XCircle className="w-8 h-8" style={{ color: '#fff' }} />
              </div>
            )}
          </div>

          {/* Title */}
          {loading && (
            <>
              <h1 className="text-2xl font-bold text-center" style={{ color: GOLD }}>
                Confirmando E-mail
              </h1>
              <p className="text-center text-sm mt-2" style={{ color: '#999' }}>
                Aguarde enquanto verificamos seu token...
              </p>
            </>
          )}

          {success && (
            <>
              <h1 className="text-2xl font-bold text-center text-green-500">
                E-mail Confirmado!
              </h1>
              <p className="text-center text-sm mt-2" style={{ color: '#999' }}>
                Sua conta foi ativada com sucesso. Redirecionando para o login...
              </p>
            </>
          )}

          {error && !loading && (
            <>
              <h1 className="text-2xl font-bold text-center text-red-500">
                Erro na Confirmação
              </h1>
              <p className="text-center text-sm mt-4 p-4 rounded-lg" style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}>
                {error}
              </p>
            </>
          )}

          {/* Back Button */}
          {(error || success) && (
            <button
              onClick={onBackToLogin}
              className="mt-8 w-full flex items-center justify-center gap-2 font-medium transition-colors py-3 rounded-lg"
              style={{
                backgroundColor: '#111',
                color: '#999',
                border: '1px solid #1a1a1a',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1a1a1a';
                e.currentTarget.style.color = GOLD;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#111';
                e.currentTarget.style.color = '#999';
              }}
            >
              <ArrowLeft size={18} />
              Voltar ao Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
