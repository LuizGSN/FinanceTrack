import { useState } from 'react';
import { createTransaction, updateTransaction } from '../api';

const GOLD = '#D4A017';

const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Alimentacao' },
  { value: 'transport', label: 'Transporte' },
  { value: 'utilities', label: 'Utilidades' },
  { value: 'entertainment', label: 'Entretenimento' },
  { value: 'healthcare', label: 'Saude' },
  { value: 'shopping', label: 'Compras' },
  { value: 'education', label: 'Educacao' },
  { value: 'other_expense', label: 'Outro' },
];

const INCOME_CATEGORIES = [
  { value: 'salary', label: 'Salario' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'investment', label: 'Investimento' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'other_income', label: 'Outro' },
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

  const handleTypeChange = (newType) => {
    setType(newType);
    if (!isEditing) setCategory('');
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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/75 backdrop-blur-sm">
      <div className="ft-panel w-full max-w-md rounded-xl p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="ft-kicker">{isEditing ? 'Editar' : 'Nova'}</p>
            <h2 className="mt-1 text-xl font-bold" style={{ color: GOLD }}>
              {isEditing ? 'Editar transacao' : 'Nova transacao'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="ft-button-secondary rounded-lg px-3 py-1.5 text-sm">
            Fechar
          </button>
        </div>

        {error && (
          <p className="p-3 rounded-lg mb-4 text-sm border border-red-500/30 bg-red-500/10 text-red-500">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Descricao"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="ft-input px-4 py-3 text-sm"
            required
          />
          <input
            type="number"
            placeholder="Valor"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="ft-input px-4 py-3 text-sm"
            required
            step="0.01"
            min="0"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="ft-input px-4 py-3 text-sm"
              required
            >
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="ft-input px-4 py-3 text-sm"
              required
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="ft-input px-4 py-3 text-sm"
            required
          >
            <option value="">Selecione uma categoria</option>
            {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="ft-button-primary flex-1 rounded-lg p-3 text-sm font-semibold"
            >
              {loading ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="ft-button-secondary flex-1 rounded-lg p-3 text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
