"use client";
/**
 * Pokemon Data Hook
 * 
 * This custom hook handles all Pokemon data fetching operations including:
 * - Paginated Pokemon list fetching
 * - Full dataset fetching for search/filtering
 * - Type-specific Pokemon data fetching and caching
 * - Loading states and error handling
 * - Request cancellation for performance optimization
 * 
 * Features:
 * - Efficient data caching with refs
 * - Parallel type data loading
 * - AbortController for request cancellation
 * - Loading state management
 * - Error handling with retry functionality
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type NamedResource = { name: string; url: string };

type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedResource[];
};

type UsePokemonDataReturn = {
  data: PokemonListResponse | null;
  allList: NamedResource[] | null;
  loading: boolean;
  error: string | null;
  typeToPokemonMap: Map<string, Set<string>>;
  typeLoading: boolean;
  retry: () => void;
};

export function usePokemonData(
  page: number,
  typeFilters: string[],
  setTypeLoading: (loading: boolean) => void,
  setPage: (page: number) => void
): UsePokemonDataReturn {
  const [data, setData] = useState<PokemonListResponse | null>(null);
  const [allList, setAllList] = useState<NamedResource[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeLoading, setTypeLoadingState] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const typeToPokemonRef = useRef<Map<string, Set<string>>>(new Map());

  const PAGE_SIZE = 24;

  // Build paginated URL
  const apiUrl = useMemo(() => {
    const offset = (page - 1) * PAGE_SIZE;
    return `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${PAGE_SIZE}`;
  }, [page]);

  // Fetch current page data
  useEffect(() => {
    setLoading(true);
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    
    fetch(apiUrl, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed: ${r.status}`);
        return r.json();
      })
      .then((json: PokemonListResponse) => setData(json))
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        const msg = e instanceof Error ? e.message : "Unknown error";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [apiUrl]);

  // Fetch full dataset for search/filtering (only once)
  useEffect(() => {
    if (allList) return; // Already loaded
    
    let ignore = false;
    const controller = new AbortController();
    const run = async () => {
      try {
        const r = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2000", { signal: controller.signal });
        if (!r.ok) throw new Error(`Request failed: ${r.status}`);
        const j: PokemonListResponse = await r.json();
        if (!ignore) setAllList(j.results);
      } catch {
        // Ignoring aborts is fine here - this is just a best-effort cache
      }
    };
    run();
    return () => { ignore = true; controller.abort(); };
  }, [allList]);

  // Fetch type data when filters change
  useEffect(() => {
    if (typeFilters.length === 0) {
      setTypeLoadingState(false);
      return;
    }

    // Check if all types are already loaded
    const unloadedTypes = typeFilters.filter(type => !typeToPokemonRef.current.has(type));
    if (unloadedTypes.length === 0) {
      setTypeLoadingState(false);
      return;
    }

    setTypeLoadingState(true);
    let cancelled = false;
    const controller = new AbortController();
    
    const loadTypes = async () => {
      try {
        const promises = unloadedTypes.map(async (type) => {
          const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`, { signal: controller.signal });
          if (!res.ok) throw new Error(`Failed to fetch type: ${res.status}`);
          type TypeResponse = { pokemon: { pokemon: { name: string } }[] };
          const j: TypeResponse = await res.json();
          if (cancelled) return;
          const set = new Set(j.pokemon.map((p) => p.pokemon.name));
          typeToPokemonRef.current.set(type, set);
        });
        
        await Promise.all(promises);
        if (!cancelled) {
          setTypeLoadingState(false);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to load type filters:", e);
          setTypeLoadingState(false);
        }
      }
    };
    
    loadTypes();
    return () => { cancelled = true; controller.abort(); };
  }, [typeFilters]);

  const retry = useCallback(() => {
    setPage(1); // Reset to page 1 on retry
  }, [setPage]);

  return {
    data,
    allList,
    loading,
    error,
    typeToPokemonMap: typeToPokemonRef.current,
    typeLoading,
    retry,
  };
}
