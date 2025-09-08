"use client";
import Link from "next/link";
import Image from "next/image";
import { FavoriteToggle } from "../favorites.client";
import styles from "./PokemonCard.module.css";

type PokemonCardProps = {
  pokemon: {
    name: string;
    url: string;
  };
};

export default function PokemonCard({ pokemon }: PokemonCardProps) {
  const id = pokemon.url.split("/").filter(Boolean).pop();
  const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  
  const formatDexNumber = (id: string | undefined) =>
    id ? `#${id.toString().padStart(3, "0")}` : "";

  return (
    <div className={styles.card}>
      <Link href={`/pokemon/${id}`} className={styles.cardLink}>
        <Image 
          src={img} 
          alt={`${pokemon.name} artwork`} 
          width={256} 
          height={256} 
          className={styles.cardImg} 
        />
        <div className={styles.cardBody}>
          <div className={styles.titleRow}>
            <Image src="/pokeball.svg" alt="Pokéball" width={16} height={16} />
            <span className={styles.dex}>{formatDexNumber(id)}</span>
          </div>
          <h3 className={styles.name}>{pokemon.name}</h3>
        </div>
      </Link>
      <div className={styles.cardActions}>
        <FavoriteToggle id={String(id)} name={pokemon.name} />
      </div>
    </div>
  );
}
