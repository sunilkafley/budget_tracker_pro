import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
export function useFocusedResource<T>(read: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const request = useRef(0);
  const load = useCallback(async () => {
    const current = ++request.current;
    setLoading(true);
    setError(undefined);
    try {
      const result = await read();
      if (current === request.current) setData(result);
    } catch (reason) {
      if (current === request.current)
        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to load data. Please try again.",
        );
    } finally {
      if (current === request.current) setLoading(false);
    }
  }, [read]);
  useFocusEffect(
    useCallback(() => {
      void load();
      return () => {
        request.current++;
      };
    }, [load]),
  );
  return { data, loading, error, load };
}
