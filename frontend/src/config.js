// Configuração da URL da API
// - Em desenvolvimento: usa proxy do vite para localhost:3000
// - Em produção: usar VITE_API_BASE_URL ou URL relativa (mesmo domínio)
const isDev = import.meta.env.MODE === 'development';
export const API_URL = import.meta.env.VITE_API_BASE_URL || '';
