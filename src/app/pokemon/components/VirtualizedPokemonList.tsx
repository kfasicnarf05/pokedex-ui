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
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const newItems = pokemon.slice((page - 1) * pageSize, page * pageSize);
    
    if (newItems.length > 0) {
      setIsTransitioning(true);
      // Small delay to allow fade out
      setTimeout(() => {
        setItemsPerPage(newItems);
        setIsTransitioning(false);
      }, 100);
    } else {
      setItemsPerPage(newItems);
    }
  }, [pokemon, page, pageSize]);

  return (
    <div className={`${styles.container} ${isTransitioning ? styles.transitioning : ''}`}>
      <ul className={styles.grid}>
        {itemsPerPage.map((pokemonItem, index) => (
          <li 
            key={pokemonItem.name} 
            className={styles.cell}
            style={{ 
              animationDelay: `${index * 0.05}s`,
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
