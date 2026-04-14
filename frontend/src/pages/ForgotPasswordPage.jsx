import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';

export default function ForgotPasswordPage({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { request } = useFetch();

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
      const response = await request('/api/v1/auth/forgot-password', 'POST', { email });
      setMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Erro ao enviar e-mail de recuperação');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="text-blue-600 dark:text-blue-400" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Esqueceu sua senha?</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Digite seu e-mail para receber instruções de recuperação
            </p>
          </div>

          {/* Messages */}
          {message && (
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-6">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? 'Enviando...' : 'Enviar E-mail de Recuperação'}
            </button>
          </form>

          {/* Back Link */}
          <button
            onClick={onBackToLogin}
            className="mt-6 w-full flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition"
          >
            <ArrowLeft size={20} />
            Voltar ao Login
          </button>
        </div>
      </div>
    </div>
  );
}
