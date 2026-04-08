import { DependencyList, useEffect, useState } from 'react';

type AsyncState<T> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  reload: () => void;
};

export function useAsyncData<T>(
  factory: () => Promise<T>,
  dependencies: DependencyList,
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setError(null);

    void factory()
      .then((value) => {
        if (!active) {
          return;
        }

        setData(value);
      })
      .catch((reason: unknown) => {
        if (!active) {
          return;
        }

        const message = reason instanceof Error ? reason.message : 'Не удалось загрузить данные';
        setError(message);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [...dependencies, reloadToken]);

  return {
    data,
    error,
    isLoading,
    reload: () => setReloadToken((value) => value + 1),
  };
}
