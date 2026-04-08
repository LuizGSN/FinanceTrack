import { useState, useEffect } from 'react';
import { getTransactions } from '../api';
import Header from '../components/Header';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6'];

export default function AnalyticsPage({ user, onLogout, onDashboard, onAnalytics }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmt = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  // Category breakdown
  const categoryData = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});
  const categoryPie = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const topCategory = categoryPie[0]?.name || '—';

  // Income vs expense bar
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0);

  const comparisonData = [
    { name: 'Receitas', value: totalIncome },
    { name: 'Despesas', value: totalExpense },
  ];

  // Timeline: spending by month
  const monthlyData = transactions.reduce((acc, t) => {
    // Parse string directly to avoid timezone shift
    const [y, m] = (t.date || '').split('-');
    const key = `${y}-${String(m).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = { month: key, income: 0, expense: 0 };
    if (t.type === 'income') acc[key].income += Number(t.amount);
    else acc[key].expense += Number(t.amount);
    return acc;
  }, {});
  const timelineData = Object.values(monthlyData).sort((a, b) => a.month - b.month);

  // Spending profile
  const totalTx = transactions.length;
  const incomeCount = transactions.filter((t) => t.type === 'income').length;
  const expenseCount = totalTx - incomeCount;
  const avgExpense = expenseCount > 0 ? totalExpense / expenseCount : 0;
  const avgIncome = incomeCount > 0 ? totalIncome / incomeCount : 0;

  // Top spending category (by total amount, not count)
  const catAmount = {};
  transactions.forEach((t) => {
    if (t.type === 'expense') {
      catAmount[t.category] = (catAmount[t.category] || 0) + Number(t.amount);
    }
  });
  const topCatEntry = Object.entries(catAmount).sort((a, b) => b[1] - a[1])[0];

  if (loading) return <p className="text-center py-12">Carregando analytics...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} onDashboard={onDashboard} onAnalytics={onAnalytics} active="analytics" />

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {totalTx === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Nenhuma transação ainda.</p>
            <p className="text-gray-400">Adicione transações no Dashboard para ver a análise aqui.</p>
          </div>
        ) : (
          <>
            {/* Profile cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Total transações</p>
                <p className="text-xl font-bold">{totalTx}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Maior categoria</p>
                <p className="text-xl font-bold">{topCategory}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Média/despesa</p>
                <p className="text-xl font-bold">{fmt(avgExpense)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Média/receita</p>
                <p className="text-xl font-bold">{fmt(avgIncome)}</p>
              </div>
            </div>

            {/* Profile analysis */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-bold mb-4">Análise de Perfil</h2>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  Você tem <strong>{expenseCount} despesa(s)</strong> e{' '}
                  <strong>{incomeCount} receita(s)</strong>.
                </p>
                {topCatEntry && (
                  <p>
                    A categoria onde você gasta mais é{' '}
                    <strong>{topCatEntry[0]}</strong> ({fmt(topCatEntry[1])} no total).
                  </p>
                )}
                {totalExpense > totalIncome ? (
                  <p className="text-red-600 font-medium">
                    Atenção: suas despesas ultrapassaram suas receitas.
                  </p>
                ) : (
                  <p className="text-green-600 font-medium">
                    Bom: suas receitas superam suas despesas. Continue assim!
                  </p>
                )}
              </div>
            </div>

            {/* Pie chart: expenses by category */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-bold mb-4">Gastos por Categoria</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryPie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => fmt(v)}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend
                    formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Comparison bar */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-bold mb-4">Receitas vs Despesas</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(v) => fmt(v)}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Bar dataKey="value" name="Valor" radius={[8, 8, 0, 0]}>
                    {comparisonData.map((entry, i) => (
                      <Cell key={i} fill={entry.name === 'Receitas' ? '#10B981' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Timeline */}
            {timelineData.length >= 2 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-bold mb-4">Evolução Mensal</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(v) => fmt(v)}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Receitas" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} name="Despesas" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
