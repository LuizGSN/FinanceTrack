import { useState } from 'react';
import Toast from '../utils/Toast';

/**
 * Custom hook para fazer requisições HTTP com tratamento automático de erros
 * @template T
 * @returns {Object} { loading, error, execute }
 */
export const useFetch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (url, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || `HTTP ${response.status}`;
        setError(errorMessage);
        Toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      Toast.success(options.successMessage || 'Success!');
      return data;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      Toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, execute };
};

export default useFetch;
