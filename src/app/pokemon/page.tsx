"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FavoriteToggle } from "./favorites.client";
import Image from "next/image";
import styles from "./pokemon.module.css";

type NamedResource = { name: string; url: string };

type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedResource[];
};

const PAGE_SIZE = 24;

export default function PokemonListPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PokemonListResponse | null>(null);
  const [allList, setAllList] = useState<NamedResource[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"number" | "name" | "name-desc" | "favorites">("number");

  // Cache of name -> set of types for items we've looked up
  const typeMapRef = useRef<Map<string, Set<string>>>(new Map());


  // Build API url with pagination
  const apiUrl = useMemo(() => {
    const offset = (page - 1) * PAGE_SIZE;
    return `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${PAGE_SIZE}`;
  }, [page]);


  // Debounced search term (client-side filter on current page for simplicity)
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim().toLowerCase()), 350);
    return () => clearTimeout(id);
  }, [query]);


  useEffect(() => {
    setLoading(true);
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    fetch(apiUrl, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed: ${r.status}`);
        return r.json();
      })
      .then((json: PokemonListResponse) => setData(json))
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        const msg = e instanceof Error ? e.message : "Unknown error";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [apiUrl]);



  // Fetch the full list once for global searching/filtering
  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    const run = async () => {
      try {
        const r = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2000", { signal: controller.signal });
        if (!r.ok) throw new Error(`Request failed: ${r.status}`);
        const j: PokemonListResponse = await r.json();
        if (!ignore) setAllList(j.results);
      } catch (e) {
        // ignore Abort
      }
    };
    run();
    return () => { ignore = true; controller.abort(); };
  }, []);



  const filtered = useMemo(() => {
    const pageDataset = data?.results ?? [];
    const fullDataset = allList ?? pageDataset;
    // If searching or filters are active, use the full dataset, otherwise just the current page dataset
    const source = debounced || typeFilter || sortBy === "favorites" ? fullDataset : pageDataset;
    let base = source.filter((p) => p.name.includes(debounced));



    // Favorites filter via sort option
    if (sortBy === "favorites") {
      try {
        const raw = localStorage.getItem("favorites");
        const favs: { id: string; name: string }[] = raw ? JSON.parse(raw) : [];
        const setFav = new Set(favs.map((f) => f.name));
        base = base.filter((p) => setFav.has(p.name));
      } catch {}
    }



    // Type filter requires fetching type list; for simplicity, filter by type name presence in URL when available
    if (typeFilter) {
      // Fallback heuristic: fetch type endpoint once and cache in-memory
      // We’ll augment via side-effect below (see ensureTypeMap)
      base = base.filter((p) => typeMapRef.current.get(p.name)?.has(typeFilter));
    }



    // Sorting
    base = base.slice();
    base.sort((a, b) => {
      const idA = Number(a.url.split("/").filter(Boolean).pop());
      const idB = Number(b.url.split("/").filter(Boolean).pop());
      if (sortBy === "number") return idA - idB;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });



    return base;
  }, [data, allList, debounced, typeFilter, sortBy]);



  useEffect(() => {
    typeMapRef.current = new Map();
  }, [page]);



  // Ensure type info for visible items (best-effort)
  useEffect(() => {
    if (!data) return;
    const controller = new AbortController();
    const run = async () => {
      const promises = data.results.map(async (p) => {
        try {
          const res = await fetch(p.url, { signal: controller.signal });
          if (!res.ok) return;
          type PokemonDetailMinimal = { types?: { type: { name: string } }[] };
          const j: PokemonDetailMinimal = await res.json();
          const types: string[] = (j.types ?? []).map((t) => t.type.name);
          typeMapRef.current.set(p.name, new Set(types));
        } catch {}
      });
      await Promise.all(promises);
    };
    run();
    return () => controller.abort();
  }, [data]);




  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));



  const formatDexNumber = (id: string | undefined) =>
    id ? `#${id.toString().padStart(3, "0")}` : "";




  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name..."
          aria-label="Search Pokémon by name"
          className={styles.search}
          />
        </div>
      </div>
      <div className={styles.filtersBar}>
        <div className={styles.filtersLeft}>
          <div className={styles.typeChips}>
            {[
              "normal","fire","water","electric","grass","ice","fighting","poison","ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy",
            ].map((t) => (
              <button
                key={t}
                type="button"
                className={`${styles.chip} ${styles[t as keyof typeof styles] ?? ''} ${typeFilter === t ? styles.chipActive : ""}`}
                onClick={() => setTypeFilter(typeFilter === t ? "" : t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.sortGroup}>
          <label htmlFor="sortSelect">Sort by:</label>
          <select id="sortSelect" value={sortBy} onChange={(e) => setSortBy(e.target.value as "number" | "name" | "name-desc" | "favorites")} className={styles.select}>
            <option value="number">Pokédex Number</option>
            <option value="name">Name (A–Z)</option>
            <option value="name-desc">Name (Z–A)</option>
            <option value="favorites">Favorites</option>
          </select>
        </div>
      </div>



      {loading && <div className={styles.skeleton}>Loading Pokémon…</div>}
      {error && (
        <div role="alert" className={styles.error}>
          {error}
          <button onClick={() => setPage((p) => p)} className={styles.retry}>
            Retry
          </button>
        </div>
      )}



      <ul className={`${styles.grid} ${styles.fade}`}>
        {filtered.slice((page-1)*PAGE_SIZE, (page)*PAGE_SIZE).map((p) => {
          const id = p.url.split("/").filter(Boolean).pop();
          const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
          return (
            <li key={p.name} className={styles.card}>
              <Link href={`/pokemon/${id}`} className={styles.cardLink}>
                <Image src={img} alt={`${p.name} artwork`} width={256} height={256} className={styles.cardImg} />
                <div className={styles.cardBody}>
                  <div className={styles.titleRow}>
                    <Image src="/pokeball.svg" alt="Pokéball" width={16} height={16} />
                    <span className={styles.dex}>{formatDexNumber(id)}</span>
                  </div>
                  <h3 className={styles.name}>{p.name}</h3>
                </div>
              </Link>
              <div className={styles.cardActions}>
                <FavoriteToggle id={String(id)} name={p.name} />
              </div>
            </li>
          );
        })}
      </ul>



      <nav className={styles.pagination} aria-label="Pagination">
        <button
          className={styles.pageBtn}
          onClick={() => {
            setPage((p) => Math.max(1, p - 1));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          disabled={page === 1 || loading}
        >
          Previous
        </button>
        <span className={styles.pageLabel}>
          Page {page} of {totalPages || "…"}
        </span>
        <button
          className={styles.pageBtn}
          onClick={() => {
            setPage((p) => p + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          disabled={!!totalPages && page >= totalPages || loading}
        >
          Next
        </button>
      </nav>
    </div>
  );
}


