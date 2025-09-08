/**
 * Pokemon Search Hook
 * 
 * This custom hook handles the filtering, searching, and sorting logic for Pokemon data.
 * It processes the raw Pokemon data based on user inputs and returns filtered results
 * with pagination information.
 * 
 * Features:
 * - Text-based Pokemon name searching
 * - Multi-type filtering with intersection logic
 * - Sorting by Pokédex number, name, or favorites
 * - Favorites filtering from localStorage
 * - Pagination calculation
 * - Memoized performance optimization
 */

"use client";
import { useMemo } from "react";
import { useFavorites } from "./useFavorites";

type NamedResource = { name: string; url: string };

type UsePokemonSearchReturn = {
  filteredPokemon: NamedResource[];
  totalPages: number;
};

export function usePokemonSearch(
  query: string,
  typeFilters: string[],
  sortBy: "number" | "name" | "name-desc" | "favorites",
  allList: NamedResource[] | null,
  pageDataset: NamedResource[] | null,
  typeToPokemonMap: Map<string, Set<string>>,
  typeLoading: boolean,
  pageSize: number
): UsePokemonSearchReturn {
  
  // Use the favorites hook to get real-time favorites updates
  const { getFavoriteNames } = useFavorites();
  
  // ===== FILTERING AND SEARCHING LOGIC =====
  const filteredPokemon = useMemo(() => {
    // Determine data source (prefer full list for search/filtering)
    const source = allList ?? pageDataset ?? [];
    const searchTerm = query.trim().toLowerCase();
    
    // Start with name-based filtering
    let base = source.filter((pokemon) => pokemon.name.includes(searchTerm));

    // ===== FAVORITES FILTERING =====
    // Apply favorites filter if sorting by favorites
    if (sortBy === "favorites") {
      const favoriteNames = getFavoriteNames();
      base = base.filter((pokemon) => favoriteNames.has(pokemon.name));
    }

    // ===== TYPE FILTERING =====
    // Apply type filters (Pokemon must match ALL selected types - intersection)
    if (typeFilters.length > 0) {
      const typeSets = typeFilters
        .map(type => typeToPokemonMap.get(type))
        .filter(Boolean) as Set<string>[];
      
      if (typeSets.length === typeFilters.length) {
        // All types are loaded, filter by intersection
        base = base.filter((pokemon) => {
          return typeSets.every(typeSet => typeSet.has(pokemon.name));
        });
      } else if (!typeLoading) {
        // Some types not loaded and not loading, return empty results
        base = [];
      }
    }

    // ===== SORTING LOGIC =====
    // Apply sorting to filtered results
    base = base.slice(); // Create a copy to avoid mutating original array
    base.sort((pokemonA, pokemonB) => {
      const idA = Number(pokemonA.url.split("/").filter(Boolean).pop());
      const idB = Number(pokemonB.url.split("/").filter(Boolean).pop());
      
      if (sortBy === "number") return idA - idB;
      if (sortBy === "name") return pokemonA.name.localeCompare(pokemonB.name);
      if (sortBy === "name-desc") return pokemonB.name.localeCompare(pokemonA.name);
      return 0; // favorites already filtered above
    });

    return base;
  }, [query, typeFilters, sortBy, allList, pageDataset, typeToPokemonMap, typeLoading, getFavoriteNames]);

  // ===== PAGINATION CALCULATION =====
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredPokemon.length / pageSize));
  }, [filteredPokemon.length, pageSize]);

  // ===== RETURN INTERFACE =====
  return {
    filteredPokemon,
    totalPages,
  };
}
