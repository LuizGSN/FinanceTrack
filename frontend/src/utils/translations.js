// Mapeamento de categorias para português
export const CATEGORY_LABELS = {
  // Despesas
  food: '🍔 Alimentação',
  transport: '🚗 Transporte',
  utilities: '💡 Utilidades',
  entertainment: '🎬 Entretenimento',
  healthcare: '🏥 Saúde',
  shopping: '🛍️ Compras',
  education: '📚 Educação',
  other_expense: '📦 Outro',

  // Receitas
  salary: '💰 Salário',
  freelance: '💼 Freelance',
  investment: '📈 Investimento',
  bonus: '🎁 Bônus',
  other_income: '📦 Outro Rendimento',
};

// Mapeamento de tipos de investimento
export const INVESTMENT_TYPE_LABELS = {
  stock: '📈 Ação',
  crypto: '₿ Criptomoeda',
  bond: '📜 Títulos',
  real_state: '🏢 Imóvel',
  fund: '💼 Fundo',
  etf: '📊 ETF',
  option: '🎯 Opções',
  future: '📅 Futuros',
  other: '📦 Outro',
};

// Função para traduzir categoria
export function getCategoryLabel(categoryKey) {
  return CATEGORY_LABELS[categoryKey] || categoryKey;
}

// Função para traduzir tipo de investimento
export function getInvestmentTypeLabel(typeKey) {
  return INVESTMENT_TYPE_LABELS[typeKey] || typeKey;
}
