import { useEffect } from 'react';

/**
 * Hook para infinite scroll usando IntersectionObserver
 * @param {Object} options - Configurações
 * @param {React.RefObject} options.ref - Ref do elemento para monitorar
 * @param {Function} options.onIntersect - Callback quando elemento fica visível
 * @param {number} options.threshold - Threshold (0-1)
 * @param {string} options.rootMargin - Margin do root
 */
export function useInfiniteScroll({ ref, onIntersect, threshold = 0.1, rootMargin = '100px' }) {
  useEffect(() => {
    if (!ref?.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onIntersect?.();
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, onIntersect, threshold, rootMargin]);
}
