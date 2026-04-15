import { useState, useEffect } from 'react';
import { getTransactions } from '../api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend, AreaChart, Area } from 'recharts';

const GOLD = '#D4A017';
const DARK_BG = '#050505';
const CARD_BG = '#0a0a0a';
const CARD_BORDER = '#1a1a1a';
const TEXT_PRIMARY = '#e5e5e5';
const TEXT_SECONDARY = '#888';
const RED = '#ef4444';
const GREEN = '#22c55e';

const COLORS = [GOLD, RED, GREEN, '#f59e0b', '#a78bfa', '#f472b6', '#22d3ee', '#fb923c', '#818cf8', '#2dd4bf'];

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const formatDate = (d) => {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

export default function AnalyticsPage({ user, onLogout, onDashboard, onAnalytics }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // --- Cálculos principais ---
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const totalTx = transactions.length;
  const incomeCount = transactions.filter((t) => t.type === 'income').length;
  const expenseCount = totalTx - incomeCount;
  const avgExpense = expenseCount > 0 ? totalExpense / expenseCount : 0;
  const avgIncome = incomeCount > 0 ? totalIncome / incomeCount : 0;

  // Dados por categoria (despesas)
  const categoryData = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});
  const categoryPie = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Dados mensais
  const monthlyData = transactions.reduce((acc, t) => {
    const [y, m] = (t.date || '').split('-');
    const key = `${y}-${String(m).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = { month: key, income: 0, expense: 0, balance: 0 };
    if (t.type === 'income') acc[key].income += Number(t.amount);
    else acc[key].expense += Number(t.amount);
    acc[key].balance = acc[key].income - acc[key].expense;
    return acc;
  }, {});
  const timelineData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  // Top categorias
  const catAmount = {};
  transactions.forEach((t) => {
    if (t.type === 'expense') catAmount[t.category] = (catAmount[t.category] || 0) + Number(t.amount);
  });
  const topCatEntry = Object.entries(catAmount).sort((a, b) => b[1] - a[1])[0];
  const bottomCatEntry = Object.entries(catAmount).sort((a, b) => a[1] - b[1])[0];

  // Análise profunda
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0;
  const topCatPercent = topCatEntry && totalExpense > 0 ? (topCatEntry[1] / totalExpense * 100).toFixed(1) : 0;

  // Frequência de transações
  const avgDaysBetweenTx = totalTx > 1 ? (() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let totalDays = 0;
    for (let i = 1; i < sorted.length; i++) {
      totalDays += (new Date(sorted[i].date) - new Date(sorted[i - 1].date)) / (1000 * 60 * 60 * 24);
    }
    return (totalDays / (sorted.length - 1)).toFixed(0);
  })() : 0;

  // Tendência (últimos 3 meses vs anteriores)
  const recentMonths = timelineData.slice(-3);
  const previousMonths = timelineData.slice(0, -3);
  const recentAvgExpense = recentMonths.length > 0 ? recentMonths.reduce((s, m) => s + m.expense, 0) / recentMonths.length : 0;
  const previousAvgExpense = previousMonths.length > 0 ? previousMonths.reduce((s, m) => s + m.expense, 0) / previousMonths.length : 0;
  const expenseTrend = previousAvgExpense > 0 ? (((recentAvgExpense - previousAvgExpense) / previousAvgExpense) * 100).toFixed(1) : 0;

  // Maior transação única
  const maxExpense = transactions.filter(t => t.type === 'expense').reduce((max, t) => Number(t.amount) > max ? Number(t.amount) : max, 0);
  const maxIncome = transactions.filter(t => t.type === 'income').reduce((max, t) => Number(t.amount) > max ? Number(t.amount) : max, 0);

  // Análise por tipo de categoria
  const essentialCategories = ['food', 'utilities', 'transport', 'health'];
  const lifestyleCategories = ['entertainment', 'shopping', 'travel', 'other'];
  const essentialTotal = transactions
    .filter(t => t.type === 'expense' && essentialCategories.includes(t.category))
    .reduce((s, t) => s + Number(t.amount), 0);
  const lifestyleTotal = transactions
    .filter(t => t.type === 'expense' && lifestyleCategories.includes(t.category))
    .reduce((s, t) => s + Number(t.amount), 0);
  const essentialPercent = totalExpense > 0 ? ((essentialTotal / totalExpense) * 100).toFixed(1) : 0;
  const lifestylePercent = totalExpense > 0 ? ((lifestyleTotal / totalExpense) * 100).toFixed(1) : 0;

  // Gerar insights profundos e personalizados
  const generateInsights = () => {
    const insights = [];

    if (totalTx === 0) {
      insights.push({
        type: 'info',
        icon: '📊',
        title: 'Sem dados ainda',
        text: 'Adicione transações no Dashboard para ver análises detalhadas do seu perfil financeiro.'
      });
      return insights;
    }

    // Taxa de economia
    const savingsNum = parseFloat(savingsRate);
    if (savingsNum > 40) {
      insights.push({
        type: 'success',
        icon: '🎯',
        title: 'Excelente taxa de economia!',
        text: `Você está economizando ${savingsRate}% da sua renda. Isso é excepcional! Mantenha esse discipline para construir patrimônio sólido.`
      });
    } else if (savingsNum > 20) {
      insights.push({
        type: 'good',
        icon: '✅',
        title: 'Boa taxa de economia',
        text: `Sua taxa de ${savingsRate}% é saudável. Considere investir o excedente para potencializar seus retornos.`
      });
    } else if (savingsNum > 0) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Atenção na economia',
        text: `Sua taxa de ${savingsRate}% é positiva, mas baixa. Revise gastos não essenciais para aumentar sua reserva.`
      });
    } else {
      insights.push({
        type: 'critical',
        icon: '🚨',
        title: 'Situação crítica!',
        text: `Suas despesas excedem suas receitas em ${Math.abs(savingsRate)}%. É urgente revisar seus gastos e encontrar formas de aumentar sua renda.`
      });
    }

    // Tendência de gastos
    const trendNum = parseFloat(expenseTrend);
    if (trendNum > 10) {
      insights.push({
        type: 'warning',
        icon: '📈',
        title: 'Gastos em aumento',
        text: `Seus gastos mensais aumentaram ${trendNum}% nos últimos 3 meses. Identifique onde estão os aumentos.`
      });
    } else if (trendNum < -10) {
      insights.push({
        type: 'success',
        icon: '📉',
        title: 'Gastos em redução',
        text: `Parabéns! Seus gastos mensais reduziram ${Math.abs(trendNum)}%. Você está no caminho certo.`
      });
    }

    // Concentração de categoria
    if (topCatEntry && parseFloat(topCatPercent) > 30) {
      insights.push({
        type: 'warning',
        icon: '🎯',
        title: 'Alta concentração de gastos',
        text: `${topCatPercent}% dos seus gastos estão em "${topCatEntry[0]}". Essa dependência alta merece atenção.`
      });
    }

    // Essenciais vs Lifestyle
    if (totalExpense > 0) {
      if (parseFloat(essentialPercent) > 70) {
        insights.push({
          type: 'info',
          icon: '🏠',
          title: 'Gastos essenciais altos',
          text: `${essentialPercent}% dos seus gastos são com necessidades básicas. Considere formas de reduzir custos fixos.`
        });
      } else if (parseFloat(lifestylePercent) > 40) {
        insights.push({
          type: 'warning',
          icon: '🛍️',
          title: 'Gastos de estilo de vida elevados',
          text: `${lifestylePercent}% dos seus gastos são com estilo de vida. Pequenos ajustes aqui podem aumentar muito sua economia.`
        });
      }
    }

    // Frequência
    if (parseFloat(avgDaysBetweenTx) < 2) {
      insights.push({
        type: 'info',
        icon: '📅',
        title: 'Alta frequência de transações',
        text: `Você registra transações quase diariamente. Isso indica bom acompanhamento financeiro!`
      });
    }

    // Maiores transações
    if (maxExpense > totalExpense * 0.3) {
      insights.push({
        type: 'warning',
        icon: '💰',
        title: 'Gasto único significativo',
        text: `Sua maior despesa (${fmt(maxExpense)}) representa mais de 30% do total. Gastos assim merecem planejamento.`
      });
    }

    return insights;
  };

  const insights = generateInsights();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: DARK_BG }}>
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: `${GOLD} transparent ${GOLD} transparent` }}></div>
          <p className="text-sm mt-4" style={{ color: TEXT_SECONDARY }}>Carregando analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: DARK_BG }}>
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: GOLD }}>Análise de Perfil</h1>
          <p className="text-sm mt-1" style={{ color: TEXT_SECONDARY }}>Insights detalhados sobre suas finanças</p>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total transações', value: totalTx, icon: '📊' },
            { label: 'Receita total', value: fmt(totalIncome), icon: '📈' },
            { label: 'Despesa total', value: fmt(totalExpense), icon: '📉' },
            { label: 'Taxa de economia', value: `${savingsRate}%`, icon: '💰' },
          ].map((card, i) => (
            <div key={i} className="p-4 rounded-xl" style={{
              backgroundColor: CARD_BG,
              border: `1px solid ${CARD_BORDER}`,
            }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{card.icon}</span>
                <p className="text-xs" style={{ color: TEXT_SECONDARY }}>{card.label}</p>
              </div>
              <p className="text-lg font-bold" style={{ color: TEXT_PRIMARY }}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Insights */}
        <div className="p-6 rounded-xl" style={{
          backgroundColor: CARD_BG,
          border: `1px solid ${CARD_BORDER}`,
        }}>
          <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: GOLD }}>
            <span>🧠</span> Análise Inteligente
          </h2>
          <div className="space-y-4">
            {insights.map((insight, i) => (
              <div
                key={i}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: insight.type === 'critical' ? 'rgba(239, 68, 68, 0.1)' :
                                   insight.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' :
                                   insight.type === 'success' ? 'rgba(34, 197, 94, 0.1)' :
                                   insight.type === 'good' ? 'rgba(34, 197, 94, 0.05)' :
                                   'rgba(212, 160, 23, 0.05)',
                  border: `1px solid ${
                    insight.type === 'critical' ? 'rgba(239, 68, 68, 0.3)' :
                    insight.type === 'warning' ? 'rgba(245, 158, 11, 0.3)' :
                    insight.type === 'success' || insight.type === 'good' ? 'rgba(34, 197, 94, 0.3)' :
                    'rgba(212, 160, 23, 0.3)'
                  }`,
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm mb-1" style={{ color: GOLD }}>{insight.title}</h3>
                    <p className="text-sm" style={{ color: TEXT_SECONDARY }}>{insight.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de pizza - Categorias */}
        {categoryPie.length > 0 && (
          <div className="p-6 rounded-xl" style={{
            backgroundColor: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
          }}>
            <h2 className="text-base font-bold mb-4" style={{ color: GOLD }}>Despesas por Categoria</h2>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={categoryPie}
                  cx="50%" cy="50%"
                  innerRadius={80} outerRadius={120}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelStyle={{ fill: TEXT_SECONDARY, fontSize: '12px' }}
                >
                  {categoryPie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => fmt(v)}
                  contentStyle={{
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #1a1a1a',
                    borderRadius: '8px',
                    color: TEXT_PRIMARY,
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Comparação Receitas vs Despesas */}
        <div className="p-6 rounded-xl" style={{
          backgroundColor: CARD_BG,
          border: `1px solid ${CARD_BORDER}`,
        }}>
          <h2 className="text-base font-bold mb-4" style={{ color: GOLD }}>Receitas vs Despesas</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Receitas', value: totalIncome },
              { name: 'Despesas', value: totalExpense },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="name" stroke={TEXT_SECONDARY} />
              <YAxis stroke={TEXT_SECONDARY} />
              <Tooltip
                formatter={(v) => fmt(v)}
                contentStyle={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #1a1a1a',
                  borderRadius: '8px',
                  color: TEXT_PRIMARY,
                }}
              />
              <Legend />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                <Cell fill={GREEN} />
                <Cell fill={RED} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Evolução mensal */}
        {timelineData.length >= 2 && (
          <div className="p-6 rounded-xl" style={{
            backgroundColor: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
          }}>
            <h2 className="text-base font-bold mb-4" style={{ color: GOLD }}>Evolução Mensal</h2>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GREEN} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={GREEN} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={RED} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={RED} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="month" stroke={TEXT_SECONDARY} />
                <YAxis stroke={TEXT_SECONDARY} />
                <Tooltip
                  formatter={(v) => fmt(v)}
                  contentStyle={{
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #1a1a1a',
                    borderRadius: '8px',
                    color: TEXT_PRIMARY,
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="income" stroke={GREEN} strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" name="Receitas" />
                <Area type="monotone" dataKey="expense" stroke={RED} strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" name="Despesas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Detalhes adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Essenciais vs Lifestyle */}
          {totalExpense > 0 && (
            <div className="p-6 rounded-xl" style={{
              backgroundColor: CARD_BG,
              border: `1px solid ${CARD_BORDER}`,
            }}>
              <h2 className="text-base font-bold mb-4" style={{ color: GOLD }}>Gastos: Essenciais vs Lifestyle</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: TEXT_SECONDARY }}>Essenciais</span>
                    <span style={{ color: GOLD }}>{essentialPercent}%</span>
                  </div>
                  <div className="h-3 rounded-full" style={{ backgroundColor: '#1a1a1a' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${essentialPercent}%`,
                        background: 'linear-gradient(90deg, #D4A017, #f59e0b)',
                      }}
                    />
                  </div>
                  <p className="text-xs mt-2" style={{ color: TEXT_SECONDARY }}>{fmt(essentialTotal)}</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: TEXT_SECONDARY }}>Lifestyle</span>
                    <span style={{ color: GOLD }}>{lifestylePercent}%</span>
                  </div>
                  <div className="h-3 rounded-full" style={{ backgroundColor: '#1a1a1a' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${lifestylePercent}%`,
                        background: 'linear-gradient(90deg, #a78bfa, #f472b6)',
                      }}
                    />
                  </div>
                  <p className="text-xs mt-2" style={{ color: TEXT_SECONDARY }}>{fmt(lifestyleTotal)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Estatísticas adicionais */}
          <div className="p-6 rounded-xl" style={{
            backgroundColor: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
          }}>
            <h2 className="text-base font-bold mb-4" style={{ color: GOLD }}>Estatísticas</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: TEXT_SECONDARY }}>Média/receita</span>
                <span className="font-semibold" style={{ color: TEXT_PRIMARY }}>{fmt(avgIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: TEXT_SECONDARY }}>Média/despesa</span>
                <span className="font-semibold" style={{ color: TEXT_PRIMARY }}>{fmt(avgExpense)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: TEXT_SECONDARY }}>Tendência gastos</span>
                <span className={`font-semibold ${parseFloat(expenseTrend) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {parseFloat(expenseTrend) > 0 ? '+' : ''}{expenseTrend}%
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: TEXT_SECONDARY }}>Freq. transações</span>
                <span className="font-semibold" style={{ color: TEXT_PRIMARY }}>A cada {avgDaysBetweenTx} dias</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
