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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="text-sm text-green-600 font-medium">Receitas</p>
        <p className="text-2xl font-bold text-green-700">{fmt(income)}</p>
      </div>
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <p className="text-sm text-red-600 font-medium">Despesas</p>
        <p className="text-2xl font-bold text-red-700">{fmt(expense)}</p>
      </div>
      <div
        className={`p-4 rounded-lg border ${
          balance >= 0
            ? 'bg-blue-50 border-blue-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <p className={`text-sm font-medium ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
          Saldo
        </p>
        <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
          {fmt(balance)}
        </p>
      </div>
    </div>
  );
}
