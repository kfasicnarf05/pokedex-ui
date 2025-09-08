"use client";
import { useEffect, useState, useTransition } from "react";
import { dispatchFavoritesUpdate } from "./hooks/useFavorites";

export function FavoriteToggle({ id, name }: { id: string; name: string }) {
  const [isFav, setIsFav] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("favorites");
      if (!raw) return;
      const arr: { id: string; name: string }[] = JSON.parse(raw);
      setIsFav(arr.some((f) => f.id === id));
    } catch {}
  }, [id]);

  const toggle = () => {
    // Optimistic update - immediately update UI
    const newFavState = !isFav;
    setIsFav(newFavState);
    
    // Then update localStorage in a transition
    startTransition(() => {
      try {
        const raw = localStorage.getItem("favorites");
        const arr: { id: string; name: string }[] = raw ? JSON.parse(raw) : [];
        const idx = arr.findIndex((f) => f.id === id);
        
        if (newFavState) {
          // Adding to favorites
          if (idx < 0) {
            arr.push({ id, name });
          }
        } else {
          // Removing from favorites
          if (idx >= 0) {
            arr.splice(idx, 1);
          }
        }
        
        localStorage.setItem("favorites", JSON.stringify(arr));
        
        // Dispatch event to notify other components
        dispatchFavoritesUpdate();
      } catch (error) {
        // Revert optimistic update on error
        setIsFav(!newFavState);
        console.error("Failed to update favorites:", error);
      }
    });
  };

  return (
    <button
      aria-pressed={isFav}
      onClick={toggle}
      disabled={isPending}
      title={isFav ? "Unfavorite" : "Favorite"}
      className="fav-toggle"
      style={{ opacity: isPending ? 0.7 : 1 }}
    >
      {isFav ? "★" : "☆"}
    </button>
  );
}


