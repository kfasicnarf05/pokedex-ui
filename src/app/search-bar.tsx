/**
 * Search Bar Component
 * 
 * This component provides a search input field that allows users to search for Pokemon
 * by name. It synchronizes the search query with the URL parameters and provides
 * real-time search functionality with debouncing handled by the parent components.
 * 
 * Features:
 * - URL-synchronized search state
 * - Real-time search input handling
 * - Accessible search interface with proper labels
 */

"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import styles from "./layout.module.css";

export default function SearchBar() {
  // ===== HOOKS AND STATE =====
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Initialize search query from URL parameters
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // ===== URL SYNCHRONIZATION =====
  // Keep the search query in sync with URL parameters
  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";
    setQuery(urlQuery);
    setDebouncedQuery(urlQuery);
  }, [searchParams]);

  // ===== DEBOUNCED URL UPDATE =====
  // Update URL after debounce delay (400ms)
  const updateURL = useCallback((searchQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  // Debounce the URL update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (debouncedQuery !== query) {
        setDebouncedQuery(query);
        updateURL(query);
      }
    }, 400); // 400ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [query, debouncedQuery, updateURL]);

  // ===== EVENT HANDLERS =====
  // Handle search input changes (immediate UI update, debounced URL update)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery); // Immediate UI update
    // URL update is handled by the debounced effect above
  };

  // ===== RENDER =====
  return (
    <div className={styles.searchWrap}>
      <span className={styles.searchIcon} aria-hidden="true">🔍</span>
      <input
        value={query}
        onChange={handleSearchChange}
        placeholder="Search Pokémon..."
        aria-label="Search Pokémon by name"
        className={styles.search}
      />
    </div>
  );
}
