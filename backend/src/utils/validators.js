// Categorias permitidas para transações
const ALLOWED_CATEGORIES = {
  income: ['salary', 'freelance', 'investment', 'bonus', 'other_income'],
  expense: ['food', 'transport', 'utilities', 'entertainment', 'healthcare', 'shopping', 'education', 'other_expense'],
};

const TRANSACTION_TYPES = ['income', 'expense'];
const INVESTMENT_TYPES = ['stock', 'crypto', 'bond', 'real_state', 'fund', 'etf', 'option', 'future', 'other'];

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6 && password.length <= 128;
}

function validateName(name) {
  const trimmed = (name || '').trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
}

function validateAmount(amount) {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 999999999;
}

function validateDate(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const date = new Date(dateStr + 'T00:00:00');
  if (!(date instanceof Date) || isNaN(date)) return false;
  // Não permitir datas no futuro — comparar usando apenas a data (sem hora)
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return dateStr <= todayStr;
}

function validateDescription(description) {
  const trimmed = (description || '').trim();
  return trimmed.length >= 1 && trimmed.length <= 200;
}

function validateTransactionType(type) {
  return TRANSACTION_TYPES.includes(type);
}

function validateCategory(category, type) {
  const allowed = ALLOWED_CATEGORIES[type] || [];
  return allowed.includes(category);
}

function validateTransaction(data) {
  const errors = {};

  if (!data.description || !validateDescription(data.description)) {
    errors.description = 'Description must be between 1 and 200 characters';
  }

  if (!validateAmount(data.amount)) {
    errors.amount = 'Amount must be a positive number up to 999,999,999';
  }

  if (!validateTransactionType(data.type)) {
    errors.type = `Type must be one of: ${TRANSACTION_TYPES.join(', ')}`;
  }

  if (!validateCategory(data.category, data.type)) {
    const allowed = ALLOWED_CATEGORIES[data.type] || [];
    errors.category = `Category must be one of: ${allowed.join(', ')}`;
  }

  if (!validateDate(data.date)) {
    errors.date = 'Date must be valid and not in the future (YYYY-MM-DD)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateAmount,
  validateDate,
  validateDescription,
  validateTransactionType,
  validateCategory,
  validateTransaction,
  validateInvestment,
  ALLOWED_CATEGORIES,
  TRANSACTION_TYPES,
  INVESTMENT_TYPES,
};

function validateInvestment(data) {
  const errors = {};

  if (!data.name || !validateName(data.name)) {
    errors.name = 'Name must be between 2 and 100 characters';
  }

  if (!INVESTMENT_TYPES.includes(data.type)) {
    errors.type = `Type must be one of: ${INVESTMENT_TYPES.join(', ')}`;
  }

  const initialAmt = parseFloat(data.initial_amount);
  if (isNaN(initialAmt) || initialAmt < 0 || initialAmt > 999999999) {
    errors.initial_amount = 'Initial amount must be a non-negative number';
  }

  const currentVal = parseFloat(data.current_value);
  if (isNaN(currentVal) || currentVal < 0 || currentVal > 999999999) {
    errors.current_value = 'Current value must be a non-negative number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
