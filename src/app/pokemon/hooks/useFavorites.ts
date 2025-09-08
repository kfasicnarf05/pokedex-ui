"use client";
/**
 * Favorites Hook
 * 
 * This custom hook manages the favorites state and provides utilities for
 * reading and updating favorites with automatic re-rendering when favorites change.
 * It listens to both localStorage changes and custom events to keep all components
 * in sync when favorites are updated.
 */

import { useEffect, useState } from "react";

export type Favorite = {
  id: string;
  name: string;
};

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoritesVersion, setFavoritesVersion] = useState(0);

  // Load favorites from localStorage on mount and when version changes
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const raw = localStorage.getItem("favorites");
        const favs: Favorite[] = raw ? JSON.parse(raw) : [];
        setFavorites(favs);
      } catch {
        setFavorites([]);
      }
    };

    loadFavorites();

    // Listen for storage events (changes from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "favorites") {
        loadFavorites();
      }
    };

    // Listen for custom favorites update events (changes from same tab)
    const handleFavoritesUpdate = () => {
      loadFavorites();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("favorites-updated", handleFavoritesUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("favorites-updated", handleFavoritesUpdate);
    };
  }, [favoritesVersion]);

  // Helper function to check if a Pokemon is favorited
  const isFavorite = (id: string): boolean => {
    return favorites.some(fav => fav.id === id);
  };

  // Helper function to get favorite names as a Set for efficient lookup
  const getFavoriteNames = (): Set<string> => {
    return new Set(favorites.map(fav => fav.name));
  };

  // Function to trigger a refresh of favorites (useful for components that update localStorage directly)
  const refreshFavorites = () => {
    setFavoritesVersion(prev => prev + 1);
  };

  return {
    favorites,
    isFavorite,
    getFavoriteNames,
    refreshFavorites,
  };
}

// Utility function to dispatch favorites update event
export function dispatchFavoritesUpdate() {
  window.dispatchEvent(new CustomEvent("favorites-updated"));
}
