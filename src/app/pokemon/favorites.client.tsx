"use client";
import { useEffect, useState } from "react";

export function FavoriteToggle({ id, name }: { id: string; name: string }) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("favorites");
      if (!raw) return;
      const arr: { id: string; name: string }[] = JSON.parse(raw);
      setIsFav(arr.some((f) => f.id === id));
    } catch {}
  }, [id]);

  const toggle = () => {
    try {
      const raw = localStorage.getItem("favorites");
      const arr: { id: string; name: string }[] = raw ? JSON.parse(raw) : [];
      const idx = arr.findIndex((f) => f.id === id);
      if (idx >= 0) {
        arr.splice(idx, 1);
        setIsFav(false);
      } else {
        arr.push({ id, name });
        setIsFav(true);
      }
      localStorage.setItem("favorites", JSON.stringify(arr));
    } catch {}
  };

  return (
    <button
      aria-pressed={isFav}
      onClick={toggle}
      title={isFav ? "Unfavorite" : "Favorite"}
      className="fav-toggle"
    >
      {isFav ? "★" : "☆"}
    </button>
  );
}


