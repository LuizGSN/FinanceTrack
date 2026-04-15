import { useState, useEffect } from 'react';
import { Trash2, Plus, TrendingUp, TrendingDown, Calendar, DollarSign, PieChart, ArrowUpRight } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';

const INVESTMENT_TYPES = [
  { value: 'stock', label: 'Ação', icon: '📈' },
  { value: 'crypto', label: 'Criptomoeda', icon: '₿' },
  { value: 'bond', label: 'Títulos', icon: '📜' },
  { value: 'real_state', label: 'Imóvel', icon: '🏢' },
  { value: 'fund', label: 'Fundo', icon: '💼' },
  { value: 'etf', label: 'ETF', icon: '📊' },
  { value: 'option', label: 'Opções', icon: '🎯' },
  { value: 'future', label: 'Futuros', icon: '📅' },
  { value: 'other', label: 'Outro', icon: '📦' },
];

const GOLD = '#D4A017';
const DARK_BG = '#050505';
const CARD_BG = '#0a0a0a';
const CARD_BORDER = '#1a1a1a';
const TEXT_PRIMARY = '#e5e5e5';
const TEXT_SECONDARY = '#888';
const RED = '#ef4444';
const GREEN = '#22c55e';

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtNumber = (v) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(v);

const formatDate = (d) => {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

const formatDateTime = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export default function InvestmentsPage({ user, onLogout, onDashboard, onAnalytics }) {
  const [investments, setInvestments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'stock',
    exchange: '',
    initial_amount: '',
    current_value: '',
    share_price: '',
    current_share_price: '',
    shares_count: '',
    purchase_date: new Date().toISOString().slice(0, 10),
    purchase_time: '',
    notes: '',
  });
  const { request } = useFetch();

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
      alert('Preencha pelo menos nome, valor inicial e valor atual');
      return;
    }
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        exchange: formData.exchange || null,
        initial_amount: parseFloat(formData.initial_amount),
        current_value: parseFloat(formData.current_value),
        share_price: formData.share_price ? parseFloat(formData.share_price) : null,
        current_share_price: formData.current_share_price ? parseFloat(formData.current_share_price) : null,
        shares_count: formData.shares_count ? parseFloat(formData.shares_count) : null,
        purchase_date: formData.purchase_date || null,
        purchase_time: formData.purchase_time || null,
        notes: formData.notes || null,
      };

      let newInvestment;
      if (editingId) {
        newInvestment = await request(`/api/v1/investments/${editingId}`, 'PUT', payload);
        setInvestments(investments.map(inv => inv.id === editingId ? newInvestment : inv));
        setEditingId(null);
      } else {
        newInvestment = await request('/api/v1/investments', 'POST', payload);
        setInvestments([...investments, newInvestment]);
      }

      resetForm();
      setShowForm(false);
    } catch (error) {
      if (error.message !== 'Sessão expirada') {
        console.error('Erro ao salvar investimento:', error);
      }
    }
  }

  function handleEdit(investment) {
    setFormData({
      name: investment.name,
      type: investment.type,
      exchange: investment.exchange || '',
      initial_amount: investment.initial_amount?.toString() || '',
      current_value: investment.current_value?.toString() || '',
      share_price: investment.share_price?.toString() || '',
      current_share_price: investment.current_share_price?.toString() || '',
      shares_count: investment.shares_count?.toString() || '',
      purchase_date: investment.purchase_date || new Date().toISOString().slice(0, 10),
      purchase_time: investment.purchase_time ? investment.purchase_time.slice(0, 5) : '',
      notes: investment.notes || '',
    });
    setEditingId(investment.id);
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      name: '',
      type: 'stock',
      exchange: '',
      initial_amount: '',
      current_value: '',
      share_price: '',
      current_share_price: '',
      shares_count: '',
      purchase_date: new Date().toISOString().slice(0, 10),
      purchase_time: '',
      notes: '',
    });
    setEditingId(null);
  }

  async function handleDeleteInvestment(id) {
    if (!window.confirm('Tem certeza que deseja deletar este investimento?')) return;
    try {
      await request(`/api/v1/investments/${id}`, 'DELETE');
      setInvestments(investments.filter((inv) => inv.id !== id));
      if (editingId === id) {
        resetForm();
        setShowForm(false);
      }
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

  // Agrupar por tipo
  const byType = investments.reduce((acc, inv) => {
    acc[inv.type] = (acc[inv.type] || 0) + (inv.current_value || 0);
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ backgroundColor: DARK_BG }}>
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: GOLD }}>Investimentos</h1>
            <p className="text-sm mt-1" style={{ color: TEXT_SECONDARY }}>Gerencie seu portfólio de investimentos</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all border-2 shadow-lg hover:shadow-xl"
            style={{
              backgroundColor: '#0a0a0a',
              color: GOLD,
              borderColor: GOLD,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1a1a1a';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 160, 23, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0a0a0a';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 160, 23, 0.1)';
            }}
          >
            <Plus size={18} />
            {editingId ? 'Editar' : 'Novo'} Investimento
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl" style={{
            backgroundColor: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
          }}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={18} style={{ color: GOLD }} />
              <p className="text-xs" style={{ color: TEXT_SECONDARY }}>Investido</p>
            </div>
            <p className="text-xl font-bold" style={{ color: TEXT_PRIMARY }}>{fmt(totalInitial)}</p>
          </div>
          <div className="p-5 rounded-xl" style={{
            backgroundColor: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
          }}>
            <div className="flex items-center gap-2 mb-2">
              <PieChart size={18} style={{ color: GOLD }} />
              <p className="text-xs" style={{ color: TEXT_SECONDARY }}>Valor Atual</p>
            </div>
            <p className="text-xl font-bold" style={{ color: TEXT_PRIMARY }}>{fmt(totalCurrent)}</p>
          </div>
          <div className="p-5 rounded-xl md:col-span-2" style={{
            backgroundColor: totalGain >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${totalGain >= 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {totalGain >= 0 ? <TrendingUp size={18} style={{ color: GREEN }} /> : <TrendingDown size={18} style={{ color: RED }} />}
                <p className="text-xs" style={{ color: TEXT_SECONDARY }}>Ganho/Perda Total</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}
                style={{ backgroundColor: totalGain >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}>
                {gainPercent}%
              </span>
            </div>
            <p className="text-xl font-bold" style={{ color: totalGain >= 0 ? GREEN : RED }}>
              {fmt(totalGain)}
            </p>
          </div>
        </div>

        {/* Alocação por tipo */}
        {Object.keys(byType).length > 0 && (
          <div className="p-5 rounded-xl" style={{
            backgroundColor: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
          }}>
            <h2 className="text-base font-bold mb-4" style={{ color: GOLD }}>Alocação por Tipo</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(byType).map(([type, value]) => {
                const typeInfo = INVESTMENT_TYPES.find(t => t.value === type) || { label: type, icon: '📦' };
                const percent = totalCurrent > 0 ? ((value / totalCurrent) * 100).toFixed(1) : 0;
                return (
                  <div key={type} className="p-3 rounded-lg text-center" style={{ backgroundColor: '#111', border: '1px solid #1a1a1a' }}>
                    <span className="text-2xl mb-1 block">{typeInfo.icon}</span>
                    <p className="text-xs font-medium" style={{ color: TEXT_PRIMARY }}>{typeInfo.label}</p>
                    <p className="text-xs" style={{ color: GOLD }}>{percent}%</p>
                    <p className="text-xs mt-1" style={{ color: TEXT_SECONDARY }}>{fmt(value)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="p-6 rounded-xl" style={{
            backgroundColor: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
          }}>
            <h2 className="text-base font-bold mb-4" style={{ color: GOLD }}>
              {editingId ? 'Editar Investimento' : 'Adicionar Investimento'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_SECONDARY }}>Nome do investimento *</label>
                <input
                  type="text"
                  placeholder="Ex: PETR4, Bitcoin, VGHF11..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: '#111',
                    color: TEXT_PRIMARY,
                    border: '1px solid #2a2a2a',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = GOLD}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_SECONDARY }}>Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: '#111',
                    color: TEXT_PRIMARY,
                    border: '1px solid #2a2a2a',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = GOLD}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
                >
                  {INVESTMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_SECONDARY }}>Bolsa/Corretora</label>
                <input
                  type="text"
                  placeholder="Ex: B3, Binance..."
                  value={formData.exchange}
                  onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: '#111',
                    color: TEXT_PRIMARY,
                    border: '1px solid #2a2a2a',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = GOLD}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_SECONDARY }}>Valor investido (R$) *</label>
                <input
                  type="number"
                  placeholder="1000.00"
                  step="0.01"
                  value={formData.initial_amount}
                  onChange={(e) => setFormData({ ...formData, initial_amount: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: '#111',
                    color: TEXT_PRIMARY,
                    border: '1px solid #2a2a2a',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = GOLD}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_SECONDARY }}>Valor atual (R$) *</label>
                <input
                  type="number"
                  placeholder="1200.00"
                  step="0.01"
                  value={formData.current_value}
                  onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: '#111',
                    color: TEXT_PRIMARY,
                    border: '1px solid #2a2a2a',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = GOLD}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_SECONDARY }}>Preço da cota na compra (R$)</label>
                <input
                  type="number"
                  placeholder="25.50"
                  step="0.0001"
                  value={formData.share_price}
                  onChange={(e) => setFormData({ ...formData, share_price: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: '#111',
                    color: TEXT_PRIMARY,
                    border: '1px solid #2a2a2a',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = GOLD}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_SECONDARY }}>Preço atual da cota (R$)</label>
                <input
                  type="number"
                  placeholder="30.00"
                  step="0.0001"
                  value={formData.current_share_price}
                  onChange={(e) => setFormData({ ...formData, current_share_price: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: '#111',
                    color: TEXT_PRIMARY,
                    border: '1px solid #2a2a2a',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = GOLD}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_SECONDARY }}>Quantidade de cotas</label>
                <input
                  type="number"
                  placeholder="100"
                  step="0.0001"
                  value={formData.shares_count}
                  onChange={(e) => setFormData({ ...formData, shares_count: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: '#111',
                    color: TEXT_PRIMARY,
                    border: '1px solid #2a2a2a',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = GOLD}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_SECONDARY }}>Data da compra</label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: '#111',
                    color: TEXT_PRIMARY,
                    border: '1px solid #2a2a2a',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = GOLD}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_SECONDARY }}>Horário da compra</label>
                <input
                  type="time"
                  value={formData.purchase_time}
                  onChange={(e) => setFormData({ ...formData, purchase_time: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: '#111',
                    color: TEXT_PRIMARY,
                    border: '1px solid #2a2a2a',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = GOLD}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_SECONDARY }}>Observações</label>
                <textarea
                  placeholder="Anotações sobre este investimento..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all resize-none"
                  style={{
                    backgroundColor: '#111',
                    color: TEXT_PRIMARY,
                    border: '1px solid #2a2a2a',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = GOLD}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                type="submit"
                onClick={handleAddInvestment}
                className="flex-1 text-sm font-semibold px-5 py-3 rounded-xl transition-all shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${GOLD} 0%, #b8860b 100%)`,
                  color: '#0A0A0A',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, #f5c542 0%, #d4a017 100%)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${GOLD} 0%, #b8860b 100%)`;
                }}
              >
                {editingId ? 'Salvar Alterações' : 'Adicionar Investimento'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="flex-1 text-sm font-medium px-5 py-3 rounded-xl transition-all"
                style={{
                  backgroundColor: '#1a1a1a',
                  color: TEXT_SECONDARY,
                  border: '1px solid #2a2a2a',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2a2a2a';
                  e.currentTarget.style.color = TEXT_PRIMARY;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1a1a';
                  e.currentTarget.style.color = TEXT_SECONDARY;
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Investments List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${GOLD} transparent ${GOLD} transparent` }}></div>
            <p className="text-sm mt-3" style={{ color: TEXT_SECONDARY }}>Carregando investimentos...</p>
          </div>
        ) : investments.length === 0 ? (
          <div className="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <line x1="8" y1="8" x2="16" y2="8"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
              <line x1="8" y1="16" x2="12" y2="16"/>
            </svg>
            <p className="text-lg font-medium" style={{ color: TEXT_SECONDARY }}>Nenhum investimento cadastrado</p>
            <p className="text-sm mt-1" style={{ color: '#555' }}>Comece adicionando seu primeiro investimento!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {investments.map((inv) => {
              const gain = inv.current_value - inv.initial_amount;
              const gainPct = inv.initial_amount > 0 ? ((gain / inv.initial_amount) * 100).toFixed(2) : 0;
              const isGain = gain >= 0;
              const typeInfo = INVESTMENT_TYPES.find(t => t.value === inv.type) || { label: inv.type, icon: '📦' };

              // Calcular valor nas cotas
              const sharesValue = inv.shares_count && inv.current_share_price ? inv.shares_count * inv.current_share_price : null;
              const shareGainPct = inv.share_price && inv.current_share_price ? (((inv.current_share_price - inv.share_price) / inv.share_price) * 100).toFixed(2) : 0;

              return (
                <div key={inv.id} className="p-5 rounded-xl" style={{
                  backgroundColor: CARD_BG,
                  border: `1px solid ${CARD_BORDER}`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{typeInfo.icon}</span>
                      <div>
                        <h3 className="font-semibold" style={{ color: TEXT_PRIMARY }}>{inv.name}</h3>
                        <div className="flex items-center gap-2 text-xs">
                          <span style={{ color: TEXT_SECONDARY }}>{typeInfo.label}</span>
                          {inv.exchange && (
                            <>
                              <span style={{ color: '#333' }}>•</span>
                              <span style={{ color: GOLD }}>{inv.exchange}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(inv)}
                        className="transition-colors p-2 rounded-lg hover:bg-[#1a1a1a]"
                        style={{ color: GOLD }}
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button
                        onClick={() => handleDeleteInvestment(inv.id)}
                        className="transition-colors p-2 rounded-lg hover:bg-[#1a0a0a]"
                        style={{ color: RED }}
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Cards de valores */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#111' }}>
                      <p className="text-xs" style={{ color: TEXT_SECONDARY }}>Investido</p>
                      <p className="font-semibold" style={{ color: TEXT_PRIMARY }}>{fmt(inv.initial_amount)}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#111' }}>
                      <p className="text-xs" style={{ color: TEXT_SECONDARY }}>Atual</p>
                      <p className="font-semibold" style={{ color: TEXT_PRIMARY }}>{fmt(inv.current_value)}</p>
                    </div>
                  </div>

                  {/* Ganho/Perda */}
                  <div className="p-3 rounded-lg mb-4 flex items-center justify-between" style={{
                    backgroundColor: isGain ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${isGain ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                  }}>
                    <div className="flex items-center gap-2">
                      {isGain ? <TrendingUp size={16} style={{ color: GREEN }} /> : <TrendingDown size={16} style={{ color: RED }} />}
                      <span className="text-xs" style={{ color: TEXT_SECONDARY }}>Resultado</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold" style={{ color: isGain ? GREEN : RED }}>{fmt(gain)}</p>
                      <p className={`text-xs font-medium ${isGain ? 'text-green-500' : 'text-red-500'}`}>{gainPct}%</p>
                    </div>
                  </div>

                  {/* Detalhes das cotas */}
                  {(inv.share_price || inv.current_share_price || inv.shares_count) && (
                    <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: '#111', border: '1px solid #1a1a1a' }}>
                      <p className="text-xs font-semibold mb-2" style={{ color: GOLD }}>Detalhes das Cotas</p>
                      <div className="space-y-2 text-xs">
                        {inv.share_price && (
                          <div className="flex justify-between">
                            <span style={{ color: TEXT_SECONDARY }}>Preço compra:</span>
                            <span className="font-medium" style={{ color: TEXT_PRIMARY }}>{fmt(inv.share_price)}</span>
                          </div>
                        )}
                        {inv.current_share_price && (
                          <div className="flex justify-between">
                            <span style={{ color: TEXT_SECONDARY }}>Preço atual:</span>
                            <span className="font-medium" style={{ color: TEXT_PRIMARY }}>{fmt(inv.current_share_price)}</span>
                          </div>
                        )}
                        {inv.shares_count && (
                          <div className="flex justify-between">
                            <span style={{ color: TEXT_SECONDARY }}>Qtd. cotas:</span>
                            <span className="font-medium" style={{ color: TEXT_PRIMARY }}>{fmtNumber(inv.shares_count)}</span>
                          </div>
                        )}
                        {sharesValue !== null && (
                          <div className="flex justify-between pt-2 mt-2" style={{ borderTop: '1px solid #1a1a1a' }}>
                            <span style={{ color: TEXT_SECONDARY }}>Valor nas cotas:</span>
                            <span className="font-medium" style={{ color: isGain ? GREEN : RED }}>{fmt(sharesValue)}</span>
                          </div>
                        )}
                        {inv.share_price && inv.current_share_price && (
                          <div className="flex justify-between">
                            <span style={{ color: TEXT_SECONDARY }}>Var. cota:</span>
                            <span className={`font-medium ${parseFloat(shareGainPct) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {parseFloat(shareGainPct) >= 0 ? '+' : ''}{shareGainPct}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Data e observações */}
                  <div className="flex items-center gap-4 text-xs" style={{ color: TEXT_SECONDARY }}>
                    {inv.purchase_date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>{formatDate(inv.purchase_date)}</span>
                        {inv.purchase_time && <span style={{ color: '#555' }}>às {inv.purchase_time.slice(0, 5)}</span>}
                      </div>
                    )}
                  </div>
                  {inv.notes && (
                    <div className="mt-2 p-2 rounded-lg" style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}>
                      <p className="text-xs" style={{ color: TEXT_SECONDARY }}>{inv.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
