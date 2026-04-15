import { useState, useEffect, useCallback, useRef } from 'react';
import { getTransactions, deleteTransaction } from '../api';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import Header from '../components/Header';
import Summary from '../components/Summary';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';

const PAGE_SIZE = 20;

export default function Dashboard({ user, onLogout, onDashboard, onAnalytics, onInvestments }) {
  const [allTransactions, setAllTransactions] = useState([]);
  const [displayedTransactions, setDisplayedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [page, setPage] = useState(1);
  const loadMoreRef = useRef(null);

  const loadTransactions = useCallback(() => {
    setLoading(true);
    const filters = {};
    if (filterType) filters.type = filterType;
    if (filterDateFrom) filters.date_from = filterDateFrom;
    if (filterDateTo) filters.date_to = filterDateTo;
    getTransactions(filters)
      .then((data) => {
        setAllTransactions(data || []);
        setPage(1);
        setDisplayedTransactions((data || []).slice(0, PAGE_SIZE));
      })
      .catch(() => setError('Erro ao carregar transações'))
      .finally(() => setLoading(false));
  }, [filterType, filterDateFrom, filterDateTo]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Infinite Scroll Logic
  useInfiniteScroll({
    ref: loadMoreRef,
    onIntersect: () => {
      if (page * PAGE_SIZE < allTransactions.length) {
        const nextPage = page + 1;
        setPage(nextPage);
        const start = 0;
        const end = nextPage * PAGE_SIZE;
        setDisplayedTransactions(allTransactions.slice(start, end));
      }
    },
  });

  function handleDelete(id) {
    deleteTransaction(id)
      .then(() => {
        setAllTransactions(allTransactions.filter((t) => t.id !== id));
        setDisplayedTransactions(displayedTransactions.filter((t) => t.id !== id));
      })
      .catch(() => setError('Erro ao deletar'));
  }

  function clearFilters() {
    setFilterType('');
    setFilterDateFrom('');
    setFilterDateTo('');
  }

  const hasMore = page * PAGE_SIZE < allTransactions.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} onLogout={onLogout} onDashboard={onDashboard} onAnalytics={onAnalytics} active="dashboard" />

      {/* Barra de filtros */}
      <div className="bg-[#0A0A0A] dark:bg-gray-800 border-t border-gray-800 dark:border-gray-700 sticky top-[52px] z-30">
        <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center gap-1.5">
          <span className="text-gray-500 text-xs mr-1 hidden sm:inline">Filtros:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#1A1A1A] dark:bg-gray-700 text-gray-200 dark:text-gray-100 border border-gray-700 dark:border-gray-600 rounded px-2 py-1 text-xs min-w-[90px]"
          >
            <option value="">Todos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
          <span className="text-gray-600 text-xs hidden sm:inline">De</span>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="bg-[#1A1A1A] dark:bg-gray-700 text-gray-200 dark:text-gray-100 border border-gray-700 dark:border-gray-600 rounded px-2 py-1 text-xs min-w-[130px]"
          />
          <span className="text-gray-600 text-xs hidden sm:inline">Até</span>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="bg-[#1A1A1A] dark:bg-gray-700 text-gray-200 dark:text-gray-100 border border-gray-700 dark:border-gray-600 rounded px-2 py-1 text-xs min-w-[130px]"
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
          <p className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 p-3 rounded text-sm">{error}</p>
        )}

        <Summary transactions={displayedTransactions} />

        <div className="flex items-center">
          <button
            onClick={() => {
              setEditingTransaction(null);
              setShowForm(true);
            }}
            className="bg-[#0A0A0A] dark:bg-gray-800 text-[#D4A017] dark:text-blue-400 font-medium px-4 py-2 rounded hover:bg-gray-900 dark:hover:bg-gray-700 text-sm border border-[#D4A017] dark:border-blue-500"
          >
            + Nova Transação
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Carregando...</p>
        ) : displayedTransactions.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhuma transação encontrada.</p>
        ) : (
          <>
            <TransactionList
              transactions={displayedTransactions}
              onEdit={(t) => {
                setEditingTransaction(t);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Carregando mais transações...</p>
              </div>
            )}
          </>
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
