import { useState, useEffect, useCallback } from 'react';
import { getTransactions, deleteTransaction } from '../api';
import Header from '../components/Header';
import Summary from '../components/Summary';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';

export default function Dashboard({ user, onLogout, onDashboard, onAnalytics }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const loadTransactions = useCallback(() => {
    setLoading(true);
    const filters = {};
    if (filterType) filters.type = filterType;
    if (filterDateFrom) filters.date_from = filterDateFrom;
    if (filterDateTo) filters.date_to = filterDateTo;
    getTransactions(filters)
      .then(setTransactions)
      .catch(() => setError('Erro ao carregar transações'))
      .finally(() => setLoading(false));
  }, [filterType, filterDateFrom, filterDateTo]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  function handleDelete(id) {
    deleteTransaction(id).then(loadTransactions).catch(() => setError('Erro ao deletar'));
  }

  function clearFilters() {
    setFilterType('');
    setFilterDateFrom('');
    setFilterDateTo('');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} onDashboard={onDashboard} onAnalytics={onAnalytics} active="dashboard" />

      {/* Barra de filtros */}
      <div className="bg-[#0A0A0A] border-t border-gray-800 sticky top-[52px] z-30">
        <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center gap-2">
          <span className="text-gray-500 text-xs">Filtros:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#1A1A1A] text-gray-200 border border-gray-700 rounded px-2 py-1 text-xs"
          >
            <option value="">Todos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
          <span className="text-gray-600 text-xs">De</span>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="bg-[#1A1A1A] text-gray-200 border border-gray-700 rounded px-2 py-1 text-xs"
          />
          <span className="text-gray-600 text-xs">Até</span>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="bg-[#1A1A1A] text-gray-200 border border-gray-700 rounded px-2 py-1 text-xs"
          />
          <button
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-300 text-xs underline ml-1"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {error && (
          <p className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</p>
        )}

        <Summary transactions={transactions} />

        <div className="flex items-center">
          <button
            onClick={() => {
              setEditingTransaction(null);
              setShowForm(true);
            }}
            className="bg-[#0A0A0A] text-[#D4A017] font-medium px-4 py-2 rounded hover:bg-gray-900 text-sm border border-[#D4A017]"
          >
            + Nova Transação
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">Carregando...</p>
        ) : (
          <TransactionList
            transactions={transactions}
            onEdit={(t) => {
              setEditingTransaction(t);
              setShowForm(true);
            }}
            onDelete={handleDelete}
          />
        )}
      </main>

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={() => {
            setShowForm(false);
            setEditingTransaction(null);
          }}
          onSave={loadTransactions}
        />
      )}
    </div>
  );
}
