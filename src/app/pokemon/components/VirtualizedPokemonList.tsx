"use client";
import PokemonCard from "./PokemonCard";
import styles from "./VirtualizedPokemonList.module.css";
import { useState, useEffect } from "react";

type NamedResource = { name: string; url: string };

type VirtualizedPokemonListProps = {
  pokemon: NamedResource[];
  page: number;
  pageSize: number;
};

export default function VirtualizedPokemonList({ 
  pokemon, 
  page, 
  pageSize 
}: VirtualizedPokemonListProps) {
  const [itemsPerPage, setItemsPerPage] = useState<NamedResource[]>([]);

  useEffect(() => {
    const newItems = pokemon.slice((page - 1) * pageSize, page * pageSize);
    setItemsPerPage(newItems);
  }, [pokemon, page, pageSize]);

  // Show empty state when no Pokemon are available
  if (itemsPerPage.length === 0 && pokemon.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🔍</div>
        <h3 className={styles.emptyTitle}>No Pokémon found</h3>
        <p className={styles.emptyMessage}>
          Try adjusting your search terms or filters to find more Pokémon.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ul className={styles.grid}>
        {itemsPerPage.map((pokemonItem, index) => (
          <li 
            key={pokemonItem.name} 
            className={styles.cell}
            style={{ 
              animationDelay: `${index * 0.03}s`,
              animationFillMode: 'both'
            }}
          >
            <PokemonCard pokemon={pokemonItem} />
          </li>
        ))}
      </ul>
    </div>
  );
}
