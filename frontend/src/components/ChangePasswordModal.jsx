import { useState } from 'react';
import { changePassword } from '../api';
import { useTheme } from '../contexts/ThemeContext';

const GOLD = '#D4A017';

export default function ChangePasswordModal({ onClose }) {
  const { isDark } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const cardBg = isDark ? '#0a0a0a' : '#ffffff';
  const border = isDark ? '#1a1a1a' : '#e2e8f0';
  const inputBg = isDark ? '#111' : '#f8fafc';
  const text = isDark ? '#e5e5e5' : '#0f172a';
  const muted = isDark ? '#888' : '#64748b';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Preencha todos os campos.');
      return;
    }

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas nao coincidem.');
      return;
    }

    try {
      setLoading(true);
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Senha alterada com sucesso.');
    } catch (err) {
      setError(err.message || 'Erro ao alterar senha.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    backgroundColor: inputBg,
    border: `1px solid ${border}`,
    color: text,
    outline: 'none',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
      <div
        className="w-full max-w-md rounded-xl p-6 shadow-2xl"
        style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold" style={{ color: GOLD }}>Alterar senha</h2>
            <p className="mt-1 text-sm" style={{ color: muted }}>Use sua senha atual para definir uma nova.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm transition-colors"
            style={{ color: muted, border: `1px solid ${border}` }}
          >
            Fechar
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-500">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: muted }}>Senha atual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg px-4 py-3 text-sm"
              style={inputStyle}
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: muted }}>Nova senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg px-4 py-3 text-sm"
              style={inputStyle}
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: muted }}>Confirmar nova senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg px-4 py-3 text-sm"
              style={inputStyle}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-3 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: `linear-gradient(135deg, ${GOLD} 0%, #b8860b 100%)`,
              color: '#0A0A0A',
            }}
          >
            {loading ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
