"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./favorites.module.css";
import { useEffect, useState } from "react";

type Favorite = { id: string; name: string };

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("favorites");
      if (raw) setFavorites(JSON.parse(raw));
    } catch {}
  }, []);

  return (
    <div className={styles.wrapper}>
      <h1>Favorites</h1>
      {favorites.length === 0 ? (
        <p>No favorites yet.</p>
      ) : (
        <ul className={styles.grid}>
          {favorites.map((f) => {
            const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${f.id}.png`;
            return (
              <li key={f.id} className={styles.card}>
                <Link href={`/pokemon/${f.id}`} className={styles.cardLink}>
                  <Image src={img} alt={`${f.name} artwork`} width={256} height={256} className={styles.cardImg} />
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{f.name}</h3>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}


