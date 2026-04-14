import { useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll(callback, options = {}) {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = '0px',
  } = options;

  const sentryRef = useRef(null);

  useEffect(() => {
    if (!sentryRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
          }
        });
      },
      { threshold, root, rootMargin }
    );

    observer.observe(sentryRef.current);

    return () => {
      if (sentryRef.current) {
        observer.unobserve(sentryRef.current);
      }
    };
  }, [callback, threshold, root, rootMargin]);

  return sentryRef;
}
