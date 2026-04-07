import { API_URL } from './config';

const BASE_URL = API_URL;

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function register(name, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${BASE_URL}/auth/me`, { headers: getHeaders() });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function getTransactions(filters = {}) {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${BASE_URL}/transactions?${params}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function createTransaction(data) {
  const res = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function updateTransaction(id, data) {
  const res = await fetch(`${BASE_URL}/transactions/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function deleteTransaction(id) {
  const res = await fetch(`${BASE_URL}/transactions/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}
