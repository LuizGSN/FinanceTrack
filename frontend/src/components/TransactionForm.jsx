import { useState } from 'react';
import { createTransaction, updateTransaction } from '../api';

const GOLD = '#D4A017';
const DARK_BG = '#141414';
const CARD_BORDER = '#1f1f1f';
const TEXT_PRIMARY = '#e5e5e5';
const TEXT_SECONDARY = '#888';

// Categorias por tipo (deve corresponder ao backend)
const EXPENSE_CATEGORIES = [
  { value: 'food', label: '🍔 Alimentação' },
  { value: 'transport', label: '🚗 Transporte' },
  { value: 'utilities', label: '💡 Utilidades' },
  { value: 'entertainment', label: '🎬 Entretenimento' },
  { value: 'healthcare', label: '🏥 Saúde' },
  { value: 'shopping', label: '🛍️ Compras' },
  { value: 'education', label: '📚 Educação' },
  { value: 'other_expense', label: '📦 Outro' },
];

const INCOME_CATEGORIES = [
  { value: 'salary', label: '💰 Salário' },
  { value: 'freelance', label: '💼 Freelance' },
  { value: 'investment', label: '📈 Investimento' },
  { value: 'bonus', label: '🎁 Bônus' },
  { value: 'other_income', label: '📦 Outro' },
];

export default function TransactionForm({ transaction, onClose, onSave }) {
  const isEditing = !!transaction;
  const [description, setDescription] = useState(transaction?.description || '');
  const [amount, setAmount] = useState(transaction?.amount || '');
  const [type, setType] = useState(transaction?.type || 'expense');
  const [category, setCategory] = useState(transaction?.category || '');
  const [date, setDate] = useState(
    transaction?.date ? transaction.date.slice(0, 10) : (() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })()
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset category when type changes (if not editing)
  const handleTypeChange = (newType) => {
    setType(newType);
    if (!isEditing) {
      setCategory('');
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { description, amount: parseFloat(amount), type, category, date };
      if (isEditing) {
        await updateTransaction(transaction.id, data);
      } else {
        await createTransaction(data);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = { backgroundColor: '#1a1a1a', color: TEXT_PRIMARY, border: '1px solid #2a2a2a' };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="p-6 rounded-lg w-full max-w-md" style={{ backgroundColor: DARK_BG, border: `1px solid ${CARD_BORDER}` }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: GOLD }}>
          {isEditing ? 'Editar Transação' : 'Nova Transação'}
        </h2>
        {error && <p className="p-3 rounded mb-4 text-sm" style={{ backgroundColor: '#1a0a0a', color: '#ef4444' }}>{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded text-sm"
            style={inputStyle}
            required
          />
          <input
            type="number"
            placeholder="Valor"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 rounded text-sm"
            style={inputStyle}
            required
            step="0.01"
            min="0"
          />
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full p-3 rounded text-sm"
            style={inputStyle}
            required
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 rounded text-sm"
            style={inputStyle}
            required
          >
            <option value="">Selecione uma categoria</option>
            {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 rounded text-sm"
            style={inputStyle}
            required
          />
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 font-semibold p-3 rounded text-sm transition-all"
              style={{ backgroundColor: GOLD, color: '#0A0A0A' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#c4940f'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = GOLD; }}
            >
              {loading ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 rounded text-sm transition-all"
              style={{ backgroundColor: '#1a1a1a', color: TEXT_SECONDARY }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2a2a2a')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1a1a1a')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
