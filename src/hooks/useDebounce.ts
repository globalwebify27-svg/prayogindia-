import { useState, useEffect } from "react";

/**
 * useDebounce hook delays updating the value until after a specified delay
 * has passed since the last time the value changed.
 *
 * @param value The value to debounce (e.g. search query string)
 * @param delay Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
