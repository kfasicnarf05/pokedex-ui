"use client";
/**
 * Pokemon Detail Page Component
 * 
 * This component displays detailed information about a specific Pokemon,
 * including its image, stats, types, and other characteristics.
 * Fetches data from PokeAPI based on the Pokemon ID from the URL.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FavoriteToggle } from "../favorites.client";
import styles from "./pokemon-detail.module.css";

interface PokemonDetailPageProps {
  params: Promise<{ id: string }>;
}

interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

interface PokemonType {
  type: {
    name: string;
  };
}

interface PokemonData {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
    front_default: string;
  };
  stats: PokemonStat[];
  types: PokemonType[];
}

export default function PokemonDetailPage({ params }: PokemonDetailPageProps) {
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pokemonId, setPokemonId] = useState<string | null>(null);

  // Unwrap the params Promise
  useEffect(() => {
    params.then((resolvedParams) => {
      setPokemonId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!pokemonId) return;

    const fetchPokemon = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch Pokemon: ${response.status}`);
        }
        
        const data: PokemonData = await response.json();
        setPokemon(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load Pokemon";
        setError(errorMessage);
        console.error("Error fetching Pokemon:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [pokemonId]);

  const formatDexNumber = (id: number) => `#${id.toString().padStart(3, "0")}`;

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div>Loading Pokemon details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <Link href="/pokemon" className={styles.back}>
          ← Back to Pokemon List
        </Link>
        <div>Error: {error}</div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className={styles.wrapper}>
        <Link href="/pokemon" className={styles.back}>
          ← Back to Pokemon List
        </Link>
        <div>Pokemon not found</div>
      </div>
    );
  }

  const imageUrl = pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default;

  return (
    <div className={styles.wrapper}>
      <Link href="/pokemon" className={styles.back}>
        ← Back to Pokemon List
      </Link>
      
      <div className={styles.card}>
        <div>
          <Image
            src={imageUrl}
            alt={`${pokemon.name} artwork`}
            width={400}
            height={400}
            className={styles.image}
            priority
          />
        </div>
        
        <div className={styles.body}>
          <div className={styles.headerRow}>
            <Image src="/pokeball.svg" alt="Pokéball" width={16} height={16} />
            <span className={styles.dex}>{formatDexNumber(pokemon.id)}</span>
            <div className={styles.favoriteInHeader}>
              <FavoriteToggle id={String(pokemon.id)} name={pokemon.name} />
            </div>
          </div>
          
          <h1 className={styles.title}>{pokemon.name}</h1>
          
          <div className={styles.meta}>
            <span>Height: {pokemon.height / 10} m</span>
            <span>Weight: {pokemon.weight / 10} kg</span>
          </div>
          
          <div className={styles.types}>
            {pokemon.types.map((typeInfo) => (
              <span 
                key={typeInfo.type.name} 
                className={`${styles.type} ${styles[typeInfo.type.name]}`}
              >
                {typeInfo.type.name}
              </span>
            ))}
          </div>
          
          <div>
            <h3>Base Stats</h3>
            <ul className={styles.stats}>
              {pokemon.stats.map((stat) => (
                <li key={stat.stat.name}>
                  <span className={styles.statName}>{stat.stat.name}:</span>
                  <span className={styles.statVal}>{stat.base_stat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
