"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Modal from "../../Modal.client";
import { FavoriteToggle } from "../../../pokemon/favorites.client";
import styles from "../../../pokemon/[id]/pokemon-detail.module.css";
import modalStyles from "../../modal.module.css";

interface PokemonModalPageProps {
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

// PokemonModalPage - displays Pokemon details in modal overlay
export default function PokemonModalPage({ params }: PokemonModalPageProps) {
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pokemonId, setPokemonId] = useState<string | null>(null);

  // Unwrap params Promise
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
      <Modal>
        <div className={modalStyles.loadingState}>
          Loading...
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal>
        <div className={styles.wrapper}>
          <div>Error: {error}</div>
        </div>
      </Modal>
    );
  }

  if (!pokemon) {
    return (
      <Modal>
        <div className={styles.wrapper}>
          <div>Pokemon not found</div>
        </div>
      </Modal>
    );
  }

  const imageUrl = pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default;

  return (
    <Modal>
      <div className={styles.wrapper}>
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
                        <h3 className={styles.statsHeading}>Base Stats</h3>
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
     </Modal>
   );
}