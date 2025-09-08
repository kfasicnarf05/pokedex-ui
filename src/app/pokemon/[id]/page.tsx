import styles from "./pokemon-detail.module.css";
import Image from "next/image";
import Link from "next/link";

type Pokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    other?: { [k: string]: { front_default?: string | null } };
    front_default?: string | null;
  };
  types: { slot: number; type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
};

async function getPokemon(id: string): Promise<Pokemon> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
    // Revalidate periodically to keep the page fresh
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch Pokémon");
  return res.json();
}

export default async function PokemonDetail({ params }: { params: { id: string } }) {
  const data = await getPokemon(params.id);
  const art = data.sprites.other?.["official-artwork"]?.front_default || data.sprites.front_default || "";

  return (
    <div className={styles.wrapper}>
      <Link href="/pokemon" className={styles.back}>
        ← Back to list
      </Link>
      <div className={styles.card}>
        {art && (
          <Image
            src={art}
            alt={`${data.name} artwork`}
            width={320}
            height={320}
            className={styles.image}
          />
        )}
        <div className={styles.body}>
          <div className={styles.headerRow}>
            <Image src="/pokeball.svg" alt="Pokéball" width={18} height={18} />
            <span className={styles.dex}>#{String(data.id).padStart(3, "0")}</span>
          </div>
          <h1 className={styles.title}>{data.name}</h1>
          <div className={styles.meta}>
            <span>Height: {data.height}</span>
            <span>Weight: {data.weight}</span>
          </div>
          <div className={styles.types}>
            {data.types.map((t) => (
              <span key={t.slot} className={`${styles.type} ${styles[`${t.type.name}` as keyof typeof styles] ?? ''}`}>
                {t.type.name}
              </span>
            ))}
          </div>
          <ul className={styles.stats}>
            {data.stats.map((s) => (
              <li key={s.stat.name}>
                <span className={styles.statName}>{s.stat.name}</span>
                <span className={styles.statVal}>{s.base_stat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}


