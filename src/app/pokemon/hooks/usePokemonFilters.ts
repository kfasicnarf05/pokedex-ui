/**
 * Pokemon Filters Hook
 * 
 * This custom hook manages all filter-related state for the Pokemon list page.
 * It handles URL synchronization, multiple type filtering, sorting, and pagination.
 * All state changes are automatically reflected in the URL for shareable links.
 * 
 * Features:
 * - Multiple type filter selection
 * - URL-synchronized state management
 * - Browser back/forward navigation support
 * - Type filter toggle and clear functionality
 * - Sorting options (number, name, favorites)
 * - Pagination state management
 */

"use client";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// ===== TYPE DEFINITIONS =====
type UsePokemonFiltersReturn = {
  query: string;
  typeFilters: string[];
  sortBy: "number" | "name" | "name-desc" | "favorites";
  page: number;
  typeLoading: boolean;
  toggleTypeFilter: (type: string) => void;
  clearTypeFilters: () => void;
  setSortBy: (sort: "number" | "name" | "name-desc" | "favorites") => void;
  setPage: (page: number) => void;
};

export function usePokemonFilters(): UsePokemonFiltersReturn {
  // ===== HOOKS =====
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ===== STATE INITIALIZATION =====
  // Initialize state from URL parameters for SSR compatibility
  const [page, setPage] = useState(() => Number(searchParams.get("page") || 1));
  const [typeFilters, setTypeFilters] = useState<string[]>(() => {
    const typesParam = searchParams.get("types");
    return typesParam ? typesParam.split(",").filter(Boolean) : [];
  });
  const [sortBy, setSortBy] = useState<"number" | "name" | "name-desc" | "favorites">(
    () => ((searchParams.get("sort") as "number" | "name" | "name-desc" | "favorites") || "number")
  );
  const [typeLoading, setTypeLoading] = useState(false);

  // Get search query from URL (managed by search bar component)
  const query = searchParams.get("q") ?? "";

  // ===== EVENT HANDLERS =====
  // Toggle a type filter on/off
  const toggleTypeFilter = useCallback((type: string) => {
    setTypeFilters(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  }, []);

  // Clear all type filters
  const clearTypeFilters = useCallback(() => {
    setTypeFilters([]);
  }, []);

  // ===== URL SYNCHRONIZATION =====
  // Push state to URL when inputs change (excluding query which is handled by header)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Handle type filters
    if (typeFilters.length > 0) {
      params.set("types", typeFilters.join(","));
    } else {
      params.delete("types");
    }
    
    // Handle sorting
    if (sortBy && sortBy !== "number") {
      params.set("sort", sortBy);
    } else {
      params.delete("sort");
    }
    
    // Handle pagination
    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }
    
    const next = `${pathname}?${params.toString()}`;
    router.replace(next);
  }, [typeFilters, sortBy, page, pathname, router, searchParams]);

  // ===== BROWSER NAVIGATION SUPPORT =====
  // Respond to back/forward navigation
  useEffect(() => {
    const typesParam = searchParams.get("types");
    setTypeFilters(typesParam ? typesParam.split(",").filter(Boolean) : []);
    setSortBy((searchParams.get("sort") as "number" | "name" | "name-desc" | "favorites") || "number");
    setPage(Number(searchParams.get("page") || 1));
  }, [searchParams]);

  // ===== RETURN INTERFACE =====
  return {
    query,
    typeFilters,
    sortBy,
    page,
    typeLoading,
    toggleTypeFilter,
    clearTypeFilters,
    setSortBy,
    setPage,
  };
}