/**
 * Pokemon List Page Component
 * 
 * This is the main component that renders the Pokemon list with filtering, sorting,
 * and pagination capabilities. It uses custom hooks for state management and data
 * fetching to provide a clean separation of concerns.
 * 
 * Features:
 * - Multi-type filtering with visual feedback
 * - Search functionality (handled by header search bar)
 * - Sorting by number, name, or favorites
 * - Pagination with smooth animations
 * - Loading states and error handling
 * - Responsive grid layout
 */

"use client";
import { useEffect, memo } from "react";
import VirtualizedPokemonList from "./components/VirtualizedPokemonList";
import { usePokemonFilters } from "./hooks/usePokemonFilters";
import { usePokemonData } from "./hooks/usePokemonData";
import { usePokemonSearch } from "./hooks/usePokemonSearch";
import { useScrollRestoration } from "./hooks/useScrollRestoration";
import styles from "./pokemon.module.css";

// ===== CONSTANTS =====
const PAGE_SIZE = 24; // Number of Pokemon to display per page

function PokemonListPage() {
  // ===== CUSTOM HOOKS =====
  // Use custom hooks for state management and data fetching
  const { 
    query, 
    typeFilters, 
    sortBy, 
    page, 
    toggleTypeFilter, 
    clearTypeFilters, 
    setSortBy, 
    setPage 
  } = usePokemonFilters();

  // Fetch Pokemon data with pagination and type filtering
  const { 
    data, 
    allList, 
    error, 
    typeToPokemonMap, 
    typeLoading: dataTypeLoading, 
    retry 
  } = usePokemonData(page, typeFilters, () => {}, setPage);

  // Apply search, filtering, and sorting to Pokemon data
  const { filteredPokemon, totalPages } = usePokemonSearch(
    query,
    typeFilters,
    sortBy,
    allList,
    data?.results ?? null,
    typeToPokemonMap,
    dataTypeLoading,
    PAGE_SIZE
  );

  const { saveCurrentPosition, scrollToTop } = useScrollRestoration();



  // ===== EFFECTS =====
  useEffect(() => {
    // Empty effect - types loaded via filter API when needed
  }, [page]);


  // Preserve scroll position when modal opens/closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveCurrentPosition();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveCurrentPosition]);

  // ===== EVENT HANDLERS =====
  const handlePageChange = (newPage: number) => {
    saveCurrentPosition();
    setPage(newPage);
    scrollToTop();
  };

  // ===== RENDER =====
  return (
    <div className={styles.wrapper}>
      {/* Toolbar section - search moved to header */}
      <div className={styles.toolbar}>
        {/* Search functionality is now handled in the header */}
      </div>

      {/* Filters and sorting section */}
      <div className={styles.filtersBar}>
        <div className={styles.filtersLeft}>
          <div className={styles.typeChips}>
            {/* Clear All button - only shown when filters are active */}
            {typeFilters.length > 0 && (
              <button
                type="button"
                className={`${styles.chip} ${styles.clearAll}`}
                onClick={clearTypeFilters}
                title="Clear all filters"
              >
                ✕ Clear All
              </button>
            )}

            {/* Type filter chips */}
            {[
              "normal","fire","water","electric","grass","ice","fighting","poison","ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy",
            ].map((type) => (
              <button
                key={type}
                type="button"
                className={`${styles.chip} ${styles[type as keyof typeof styles] ?? ''} ${typeFilters.includes(type) ? styles.chipActive : ""}`}
                onClick={() => toggleTypeFilter(type)}
                title={`Filter by ${type} type`}
              >
                {type}
                {typeFilters.includes(type) && <span className={styles.checkmark}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Sorting controls */}
        <div className={styles.sortGroup}>
          <label htmlFor="sortSelect">Sort by:</label>
          <select
            id="sortSelect"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "number" | "name" | "name-desc" | "favorites")}
            className={styles.select}
          >
            <option value="number">Pokédex Number</option>
            <option value="name">Name (A–Z)</option>
            <option value="name-desc">Name (Z–A)</option>
            <option value="favorites">Favorites</option>
          </select>
        </div>
      </div>

      {/* Loading and error states */}
      {dataTypeLoading && <div className={styles.skeleton}>Loading type filter…</div>}
      {error && (
        <div role="alert" className={styles.error}>
          {error}
          <button onClick={retry} className={styles.retry}>
            Retry
          </button>
        </div>
      )}

      {/* Pokemon list with animations */}
      <VirtualizedPokemonList
        pokemon={filteredPokemon}
        page={page}
        pageSize={PAGE_SIZE}
      />

      {/* Pagination controls */}
      <nav className={styles.pagination} aria-label="Pagination">
        <button
          className={styles.pageBtn}
          onClick={() => handlePageChange(Math.max(1, page - 1))}
          disabled={page === 1 || dataTypeLoading}
        >
          Previous
        </button>
        <span className={styles.pageLabel}>
          Page {page} of {totalPages || "…"}
        </span>
        <button
          className={styles.pageBtn}
          onClick={() => handlePageChange(page + 1)}
          disabled={!!totalPages && page >= totalPages || dataTypeLoading}
        >
          Next
        </button>
      </nav>
    </div>
  );
}

// Wrap with memo to prevent unnecessary re-renders during modal navigation
export default memo(PokemonListPage);