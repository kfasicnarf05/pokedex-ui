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
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import styles from "./layout.module.css";

export default function SearchBar() {
  // ===== HOOKS AND STATE =====
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Initialize search query from URL parameters
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");

  // ===== URL SYNCHRONIZATION =====
  // Keep the search query in sync with URL parameters
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  // ===== EVENT HANDLERS =====
  // Handle search input changes and update URL
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Update URL with search query
    const params = new URLSearchParams(searchParams.toString());
    if (newQuery.trim()) {
      params.set("q", newQuery.trim());
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`);
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
