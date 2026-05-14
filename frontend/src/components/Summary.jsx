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

  const items = [
    {
      label: 'Receitas',
      value: income,
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.1)',
      border: 'rgba(34, 197, 94, 0.22)',
      path: <path d="M12 19V5M5 12l7-7 7 7" />,
    },
    {
      label: 'Despesas',
      value: expense,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.22)',
      path: <path d="M12 5v14M5 12l7 7 7-7" />,
    },
    {
      label: 'Saldo',
      value: balance,
      color: balance >= 0 ? '#D4A017' : '#ef4444',
      bg: balance >= 0 ? 'rgba(212, 160, 23, 0.11)' : 'rgba(239, 68, 68, 0.1)',
      border: balance >= 0 ? 'rgba(212, 160, 23, 0.24)' : 'rgba(239, 68, 68, 0.22)',
      path: <><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M16 10h2" /></>,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="ft-panel p-5 rounded-xl"
          style={{ borderColor: item.border }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase" style={{ color: '#8d887c' }}>
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-bold" style={{ color: item.color }}>
                {fmt(item.value)}
              </p>
            </div>
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: item.bg, border: `1px solid ${item.border}` }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke={item.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {item.path}
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
