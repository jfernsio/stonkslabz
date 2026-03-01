import { useCallback, useRef } from 'react';

export const useThrottle = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const throttleRef = useRef(false);

  return useCallback((...args: Parameters<T>) => {
    if (!throttleRef.current) {
      callback(...args);
      throttleRef.current = true;
      setTimeout(() => {
        throttleRef.current = false;
      }, delay);
    }
  }, [callback, delay]);
};