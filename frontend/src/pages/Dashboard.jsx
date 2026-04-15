import { useState, useEffect, useCallback, useRef } from 'react';
import { getTransactions, deleteTransaction } from '../api';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import Summary from '../components/Summary';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';

const PAGE_SIZE = 20;

const GOLD = '#D4A017';
const DARK_BG = '#050505';
const CARD_BG = '#0a0a0a';
const CARD_BORDER = '#1a1a1a';
const TEXT_PRIMARY = '#e5e5e5';
const TEXT_SECONDARY = '#888';

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

  useInfiniteScroll({
    ref: loadMoreRef,
    onIntersect: () => {
      if (page * PAGE_SIZE < allTransactions.length) {
        const nextPage = page + 1;
        setPage(nextPage);
        setDisplayedTransactions(allTransactions.slice(0, nextPage * PAGE_SIZE));
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
    <div className="min-h-screen" style={{ backgroundColor: DARK_BG }}>
      {/* Barra de filtros */}
      <div className="sticky top-0 z-30" style={{
        backgroundColor: '#0a0a0a',
        borderBottom: '1px solid #1a1a1a',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
      }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider mr-1" style={{ color: GOLD }}>Filtros:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg px-3 py-2 text-xs font-medium transition-all"
            style={{
              backgroundColor: '#111',
              color: TEXT_PRIMARY,
              border: '1px solid #2a2a2a',
              outline: 'none',
              cursor: 'pointer',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = GOLD}
            onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
          >
            <option value="">Todos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
          <span className="text-xs font-medium" style={{ color: '#555' }}>De</span>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="rounded-lg px-3 py-2 text-xs font-medium transition-all"
            style={{
              backgroundColor: '#111',
              color: TEXT_PRIMARY,
              border: '1px solid #2a2a2a',
              outline: 'none',
              cursor: 'pointer',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = GOLD}
            onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
          />
          <span className="text-xs font-medium" style={{ color: '#555' }}>Até</span>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="rounded-lg px-3 py-2 text-xs font-medium transition-all"
            style={{
              backgroundColor: '#111',
              color: TEXT_PRIMARY,
              border: '1px solid #2a2a2a',
              outline: 'none',
              cursor: 'pointer',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = GOLD}
            onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
          />
          <button
            onClick={clearFilters}
            className="text-xs font-medium ml-2 transition-all px-3 py-2 rounded-lg"
            style={{ color: '#666', backgroundColor: '#111', border: '1px solid #2a2a2a' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = GOLD;
              e.currentTarget.style.borderColor = GOLD;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#666';
              e.currentTarget.style.borderColor = '#2a2a2a';
            }}
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {error && (
          <div className="p-4 rounded-xl border" style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            borderColor: 'rgba(239, 68, 68, 0.3)'
          }}>
            {error}
          </div>
        )}

        <Summary transactions={displayedTransactions} />

        <div className="flex items-center">
          <button
            onClick={() => {
              setEditingTransaction(null);
              setShowForm(true);
            }}
            className="font-semibold px-6 py-3 rounded-xl text-sm transition-all border-2 shadow-lg hover:shadow-xl"
            style={{
              backgroundColor: '#0a0a0a',
              color: GOLD,
              borderColor: GOLD,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1a1a1a';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 160, 23, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0a0a0a';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 160, 23, 0.1)';
            }}
          >
            + Nova Transação
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${GOLD} transparent ${GOLD} transparent` }}></div>
            <p className="text-sm mt-3" style={{ color: TEXT_SECONDARY }}>Carregando transações...</p>
          </div>
        ) : displayedTransactions.length === 0 ? (
          <div className="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <line x1="8" y1="8" x2="16" y2="8"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
              <line x1="8" y1="16" x2="12" y2="16"/>
            </svg>
            <p className="text-lg font-medium" style={{ color: TEXT_SECONDARY }}>Nenhuma transação encontrada</p>
            <p className="text-sm mt-1" style={{ color: '#555' }}>Comece adicionando sua primeira transação!</p>
          </div>
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
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: GOLD, animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: GOLD, animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: GOLD, animationDelay: '300ms' }}></div>
                </div>
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
