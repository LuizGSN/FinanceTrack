export default function TransactionList({ transactions, onEdit, onDelete }) {
  function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatDate(dateStr) {
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    }
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  function handleDelete(id, description) {
    if (window.confirm(`Deseja excluir "${description}"?`)) {
      onDelete(id);
    }
  }

  if (transactions.length === 0) {
    return <p className="text-center py-8 text-sm" style={{ color: '#666' }}>Nenhuma transação encontrada.</p>;
  }

  return (
    <div className="space-y-2">
      {transactions.map((t) => (
        <div
          key={t.id}
          className="p-4 rounded-lg flex justify-between items-center transition-all duration-200 group"
          style={{ backgroundColor: '#141414', border: '1px solid #1f1f1f' }}
        >
          <div className="flex items-center gap-3">
            <div className={`w-1 h-10 rounded ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <p className="font-medium" style={{ color: '#e5e5e5' }}>{t.description}</p>
              <p className="text-sm" style={{ color: '#666' }}>{t.category} • {formatDate(t.date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className={`font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
              {t.type === 'income' ? '+' : '-'} {formatCurrency(Number(t.amount))}
            </p>
            <button
              onClick={() => onEdit(t)}
              className="p-2 rounded-lg transition-colors opacity-70 hover:opacity-100"
              style={{ color: '#3b82f6' }}
              title="Editar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={() => handleDelete(t.id, t.description)}
              className="p-2 rounded-lg transition-colors opacity-70 hover:opacity-100"
              style={{ color: '#ef4444' }}
              title="Excluir"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
