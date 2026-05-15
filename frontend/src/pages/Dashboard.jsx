import { useState, useEffect, useCallback, useRef } from 'react';
import { getTransactions, deleteTransaction } from '../api';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import Summary from '../components/Summary';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';

const PAGE_SIZE = 20;

const GOLD = '#D4A017';

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
    <div className="ft-page">
      {/* Barra de filtros */}
      <div className="ft-topbar sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider mr-1" style={{ color: GOLD }}>Filtros:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="ft-input rounded-lg px-3 py-2 text-xs font-medium transition-all"
            style={{ cursor: 'pointer' }}
          >
            <option value="">Todos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
          <span className="text-xs font-medium" style={{ color: 'var(--ft-muted)' }}>De</span>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="ft-input rounded-lg px-3 py-2 text-xs font-medium transition-all"
            style={{ cursor: 'pointer' }}
          />
          <span className="text-xs font-medium" style={{ color: 'var(--ft-muted)' }}>Ate</span>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="ft-input rounded-lg px-3 py-2 text-xs font-medium transition-all"
            style={{ cursor: 'pointer' }}
          />
          <button
            onClick={clearFilters}
            className="ft-button-secondary text-xs font-medium ml-2 transition-all px-3 py-2 rounded-lg"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Conteudo */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
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

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="ft-kicker">Transacoes</p>
            <h1 className="mt-1 text-2xl font-bold" style={{ color: 'var(--ft-text)' }}>Fluxo financeiro</h1>
          </div>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setShowForm(true);
            }}
            className="ft-button-primary font-semibold px-5 py-3 rounded-xl text-sm"
            style={{}}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'none';
            }}
          >
            + Nova Transacao
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${GOLD} transparent ${GOLD} transparent` }}></div>
            <p className="text-sm mt-3" style={{ color: 'var(--ft-muted)' }}>Carregando transacoes...</p>
          </div>
        ) : displayedTransactions.length === 0 ? (
          <div className="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="var(--ft-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <line x1="8" y1="8" x2="16" y2="8"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
              <line x1="8" y1="16" x2="12" y2="16"/>
            </svg>
            <p className="text-lg font-medium" style={{ color: 'var(--ft-muted)' }}>Nenhuma transacao encontrada</p>
            <p className="text-sm mt-1" style={{ color: 'var(--ft-muted)' }}>Comece adicionando sua primeira transacao.</p>
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
