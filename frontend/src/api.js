import { API_URL } from './config';
import Toast from './utils/Toast';

const BASE_URL = API_URL;

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse(res, options = {}) {
  // Treat 401 as special case (token expired)
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    Toast.error('Sessão expirada. Faça login novamente.');
    // Dispatch custom event so App.jsx can handle redirect internally
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    throw new Error('Sessão expirada');
  }

  let errorMessage = 'Erro desconhecido';
  try {
    if (res.ok) {
      return res.status === 204 ? {} : await res.json();
    }

    const body = await res.json();
    errorMessage = body?.error || body?.message || `Erro ${res.status}`;
  } catch (err) {
    errorMessage = `Erro ${res.status}: ${res.statusText}`;
  }

  // Show error toast if enabled
  if (options.showError !== false) {
    Toast.error(errorMessage);
  }

  const error = new Error(errorMessage);
  error.status = res.status;
  error.originalResponse = res;
  throw error;
}

export async function register(name, email, password) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    const data = await handleResponse(res, { showError: false });
    Toast.success('Conta criada! Verifique seu email para confirmar o cadastro.');
    return data;
  } catch (err) {
    throw err;
  }
}

export async function login(email, password) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res, { showError: false });
    Toast.success('Login realizado com sucesso!');
    return data;
  } catch (err) {
    throw err;
  }
}

export async function getMe() {
  const res = await fetch(`${BASE_URL}/api/v1/auth/me`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function getTransactions(filters = {}) {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${BASE_URL}/api/v1/transactions?${params}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function createTransaction(data) {
  const res = await fetch(`${BASE_URL}/api/v1/transactions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateTransaction(id, data) {
  const res = await fetch(`${BASE_URL}/api/v1/transactions/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteTransaction(id) {
  const res = await fetch(`${BASE_URL}/api/v1/transactions/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function getInvestments() {
  const res = await fetch(`${BASE_URL}/api/v1/investments`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function createInvestment(data) {
  const res = await fetch(`${BASE_URL}/api/v1/investments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateInvestment(id, data) {
  const res = await fetch(`${BASE_URL}/api/v1/investments/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteInvestment(id) {
  const res = await fetch(`${BASE_URL}/api/v1/investments/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function getInvestmentsSummary() {
  const res = await fetch(`${BASE_URL}/api/v1/investments/summary`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function sendForgotPassword(email) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
    const data = await handleResponse(res, { showError: false });
    Toast.success('E-mail de recuperação enviado!');
    return data;
  } catch (err) {
    throw err;
  }
}

export async function resetPassword(token, newPassword) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await handleResponse(res, { showError: false });
    Toast.success('Senha redefinida com sucesso!');
    return data;
  } catch (err) {
    throw err;
  }
}

export async function confirmEmail(token) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/confirm-email?token=${encodeURIComponent(token)}`, {
      headers: getHeaders(),
    });
    return handleResponse(res, { showError: false });
  } catch (err) {
    throw err;
  }
}
