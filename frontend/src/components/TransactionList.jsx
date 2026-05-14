import { getCategoryLabel } from '../utils/translations';

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
    return <p className="text-center py-8 text-sm" style={{ color: '#8d887c' }}>Nenhuma transacao encontrada.</p>;
  }

  return (
    <div className="space-y-3">
      {transactions.map((t) => {
        const isIncome = t.type === 'income';
        const color = isIncome ? '#22c55e' : '#ef4444';
        return (
          <div
            key={t.id}
            className="ft-panel-subtle rounded-xl p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-all duration-200"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="h-11 w-1 rounded-full"
                style={{ backgroundColor: color, boxShadow: `0 0 18px ${color}33` }}
              />
              <div className="min-w-0">
                <p className="truncate font-semibold" style={{ color: '#e7e5df' }}>{t.description}</p>
                <p className="mt-1 text-sm" style={{ color: '#8d887c' }}>
                  {getCategoryLabel(t.category)} · {formatDate(t.date)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <p className="font-bold" style={{ color }}>
                {isIncome ? '+' : '-'} {formatCurrency(Number(t.amount))}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(t)}
                  className="ft-button-secondary h-9 w-9 rounded-lg inline-flex items-center justify-center"
                  title="Editar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(t.id, t.description)}
                  className="h-9 w-9 rounded-lg inline-flex items-center justify-center transition-colors"
                  style={{ color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.18)', background: 'rgba(239, 68, 68, 0.06)' }}
                  title="Excluir"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
