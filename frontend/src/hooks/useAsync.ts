/**
 * useAsync Hook
 * Custom hook for managing async operations and loading states
 */

import { useEffect, useState, useCallback, useRef } from "react";

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const isMountedRef = useRef(true);

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await asyncFunction();
      if (isMountedRef.current) {
        setState({ data: response, loading: false, error: null });
        onSuccess?.(response);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (isMountedRef.current) {
        setState({ data: null, loading: false, error: err });
        onError?.(err);
      }
    }
  }, [asyncFunction, onSuccess, onError]);

  useEffect(() => {
    isMountedRef.current = true;
    if (immediate) {
      execute();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [execute, immediate]);

  return {
    ...state,
    execute,
  };
}
