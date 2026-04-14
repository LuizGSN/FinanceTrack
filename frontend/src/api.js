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
    window.location.href = '/login';
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
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    const data = await handleResponse(res);
    Toast.success('Conta criada com sucesso!');
    return data;
  } catch (err) {
    throw err;
  }
}

export async function login(email, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    Toast.success('Login realizado com sucesso!');
    return data;
  } catch (err) {
    throw err;
  }
}

export async function getMe() {
  const res = await fetch(`${BASE_URL}/auth/me`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function getTransactions(filters = {}) {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${BASE_URL}/transactions?${params}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function createTransaction(data) {
  const res = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateTransaction(id, data) {
  const res = await fetch(`${BASE_URL}/transactions/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteTransaction(id) {
  const res = await fetch(`${BASE_URL}/transactions/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(res);
}
