export default function Summary({ transactions }) {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expense;

  function fmt(v) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(v);
  }

  const GOLD = '#D4A017';
  const GREEN = '#22c55e';
  const RED = '#ef4444';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Receitas */}
      <div className="p-5 rounded-xl" style={{
        backgroundColor: '#0a0a0a',
        border: `1px solid rgba(34, 197, 94, 0.3)`,
        boxShadow: '0 2px 8px rgba(34, 197, 94, 0.1)',
      }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" style={{ color: GREEN }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          </div>
          <p className="text-sm font-medium" style={{ color: GREEN }}>Receitas</p>
        </div>
        <p className="text-2xl font-bold" style={{ color: GREEN }}>{fmt(income)}</p>
      </div>

      {/* Despesas */}
      <div className="p-5 rounded-xl" style={{
        backgroundColor: '#0a0a0a',
        border: `1px solid rgba(239, 68, 68, 0.3)`,
        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)',
      }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" style={{ color: RED }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          </div>
          <p className="text-sm font-medium" style={{ color: RED }}>Despesas</p>
        </div>
        <p className="text-2xl font-bold" style={{ color: RED }}>{fmt(expense)}</p>
      </div>

      {/* Saldo */}
      <div className="p-5 rounded-xl" style={{
        backgroundColor: '#0a0a0a',
        border: `1px solid ${balance >= 0 ? 'rgba(212, 160, 23, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        boxShadow: `0 2px 8px ${balance >= 0 ? 'rgba(212, 160, 23, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`,
      }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: balance >= 0 ? 'rgba(212, 160, 23, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" style={{ color: balance >= 0 ? GOLD : RED }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
          </div>
          <p className="text-sm font-medium" style={{ color: balance >= 0 ? GOLD : RED }}>Saldo</p>
        </div>
        <p className="text-2xl font-bold" style={{ color: balance >= 0 ? GOLD : RED }}>
          {fmt(balance)}
        </p>
      </div>
    </div>
  );
}
