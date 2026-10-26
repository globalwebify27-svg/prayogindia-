import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";

export interface SearchSuggestionItem {
  id: string;
  slug: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  mrp?: number;
  rating?: number;
  inStock: boolean;
  image: string;
  brand?: string;
}

// Client-side in-memory cache to eliminate repeated network/DB requests during user typing/backspacing
const clientSearchCache = new Map<string, SearchSuggestionItem[]>();

export function useSearchSuggestions(query: string, delay: number = 300, limit: number = 5) {
  const debouncedQuery = useDebounce(query.trim(), delay);
  const [suggestions, setSuggestions] = useState<SearchSuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Instant feedback: if query is empty, clear suggestions and don't load
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    } else if (query.trim() !== debouncedQuery) {
      // User is currently typing (before debounce fires)
      setIsLoading(true);
    }
  }, [query, debouncedQuery]);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (!trimmed) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const cacheKey = `${trimmed.toLowerCase()}__${limit}`;

    // 1. Instant check in client-side memory cache
    if (clientSearchCache.has(cacheKey)) {
      setSuggestions(clientSearchCache.get(cacheKey) || []);
      setIsLoading(false);
      return;
    }

    // 2. Abort previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=${limit}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Search request failed");
        return res.json();
      })
      .then((json) => {
        if (json?.success && Array.isArray(json.data)) {
          clientSearchCache.set(cacheKey, json.data);
          setSuggestions(json.data);
        } else {
          setSuggestions([]);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.warn("[useSearchSuggestions] fetch error:", err);
        }
      })
      .finally(() => {
        if (abortControllerRef.current === controller) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery, limit]);

  return {
    suggestions,
    isLoading,
    debouncedQuery,
  };
}
