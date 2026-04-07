export default function TransactionList({ transactions, onEdit, onDelete }) {
  function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatDate(dateStr) {
    // Avoid timezone shift — the DB stores dates as YYYY-MM-DD
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    }
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  if (transactions.length === 0) {
    return <p className="text-center text-gray-500 py-8">Nenhuma transação encontrada.</p>;
  }

  return (
    <div className="space-y-2">
      {transactions.map((t) => (
        <div key={t.id} className="bg-white p-4 rounded shadow-sm flex justify-between items-center">
          <div>
            <p className="font-medium">{t.description}</p>
            <p className="text-sm text-gray-500">{t.category} • {formatDate(t.date)}</p>
          </div>
          <div className="flex items-center gap-4">
            <p className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
              {t.type === 'income' ? '+' : '-'} {formatCurrency(Number(t.amount))}
            </p>
            <button onClick={() => onEdit(t)} className="text-blue-600 hover:underline text-sm">Editar</button>
            <button onClick={() => onDelete(t.id)} className="text-red-600 hover:underline text-sm">Excluir</button>
          </div>
        </div>
      ))}
    </div>
  );
}
