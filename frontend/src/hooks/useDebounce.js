import { useState, useEffect } from 'react';

/**
 * Debounces a value — useful for search inputs to reduce API calls.
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default 400ms)
 * @returns debounced value
 */
export const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
