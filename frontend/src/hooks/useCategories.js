import { useState, useEffect } from 'react';

const DEFAULT_CATEGORIES = {
  income: ['salary', 'freelance', 'investment', 'bonus', 'other_income'],
  expense: ['food', 'transport', 'utilities', 'entertainment', 'healthcare', 'shopping', 'education', 'other_expense'],
};

export function useCategories() {
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('userCategories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  // Salvar categorias no localStorage quando mudam
  useEffect(() => {
    localStorage.setItem('userCategories', JSON.stringify(categories));
  }, [categories]);

  const addCategory = (type, category) => {
    setCategories((prev) => ({
      ...prev,
      [type]: [...new Set([...prev[type], category])], // Evitar duplicatas
    }));
  };

  const removeCategory = (type, category) => {
    setCategories((prev) => ({
      ...prev,
      [type]: prev[type].filter((cat) => cat !== category),
    }));
  };

  const resetCategories = () => {
    setCategories(DEFAULT_CATEGORIES);
  };

  return { categories, addCategory, removeCategory, resetCategories };
}
