import { useState, useEffect } from 'react';
import { Trash2, Plus, TrendingUp } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';

const INVESTMENT_TYPES = ['stock', 'crypto', 'bond', 'real_state', 'fund', 'other'];
const TYPE_LABELS = {
  stock: 'Ação',
  crypto: 'Criptomoeda',
  bond: 'Títulos',
  real_state: 'Imóvel',
  fund: 'Fundo',
  other: 'Outro',
};

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function InvestmentsPage({ user, onLogout, onDashboard, onAnalytics }) {
  const [investments, setInvestments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    type: 'stock',
    initial_amount: '',
    current_value: '',
  });
  const { request } = useFetch();

  // Load investments
  useEffect(() => {
    loadInvestments();
  }, []);

  async function loadInvestments() {
    try {
      setLoading(true);
      const data = await request('/api/v1/investments', 'GET');
      setInvestments(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.message !== 'Sessão expirada') {
        console.error('Erro ao carregar investimentos:', error);
      }
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddInvestment(e) {
    e.preventDefault();

    if (!formData.name || !formData.initial_amount || !formData.current_value) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      const newInvestment = await request('/api/v1/investments', 'POST', {
        name: formData.name,
        type: formData.type,
        initial_amount: parseFloat(formData.initial_amount),
        current_value: parseFloat(formData.current_value),
      });

      setInvestments([...investments, newInvestment]);
      setFormData({ name: '', type: 'stock', initial_amount: '', current_value: '' });
      setShowForm(false);
    } catch (error) {
      if (error.message !== 'Sessão expirada') {
        console.error('Erro ao adicionar investimento:', error);
      }
    }
  }

  async function handleDeleteInvestment(id) {
    if (!window.confirm('Tem certeza que deseja deletar este investimento?')) return;

    try {
      await request(`/api/v1/investments/${id}`, 'DELETE');
      setInvestments(investments.filter((inv) => inv.id !== id));
    } catch (error) {
      if (error.message !== 'Sessão expirada') {
        console.error('Erro ao deletar investimento:', error);
      }
    }
  }

  const totalInitial = investments.reduce((sum, inv) => sum + (inv.initial_amount || 0), 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + (inv.current_value || 0), 0);
  const totalGain = totalCurrent - totalInitial;
  const gainPercent = totalInitial > 0 ? ((totalGain / totalInitial) * 100).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie seus investimentos</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onDashboard}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm"
            >
              Transações
            </button>
            <button
              onClick={onAnalytics}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm"
            >
              Analytics
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus size={20} />
              Novo Investimento
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Investimento Inicial</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {fmt(totalInitial)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Valor Atual</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {fmt(totalCurrent)}
            </p>
          </div>
          <div className={`p-6 rounded-lg shadow ${totalGain >= 0 ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-red-900'}`}>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 flex items-center gap-2">
              <TrendingUp size={16} /> Ganho/Perda
            </p>
            <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {fmt(totalGain)} ({gainPercent}%)
            </p>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <form onSubmit={handleAddInvestment} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Adicionar Investimento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome do investimento"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {INVESTMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Valor inicial"
                step="0.01"
                value={formData.initial_amount}
                onChange={(e) => setFormData({ ...formData, initial_amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Valor atual"
                step="0.01"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Adicionar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Investments List */}
        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Carregando...</p>
        ) : investments.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Nenhum investimento cadastrado</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {investments.map((inv) => {
              const gain = inv.current_value - inv.initial_amount;
              const gainPct = inv.initial_amount > 0 ? ((gain / inv.initial_amount) * 100).toFixed(2) : 0;
              return (
                <div key={inv.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{inv.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{TYPE_LABELS[inv.type]}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteInvestment(inv.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Inicial:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{fmt(inv.initial_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Atual:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{fmt(inv.current_value)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Ganho/Perda:</span>
                      <span className={`font-semibold ${gain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {fmt(gain)} ({gainPct}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
