/**
 * Pokemon Detail Page Entry Point
 * 
 * This file serves as the entry point for individual Pokemon detail pages.
 * It renders the PokemonDetailPage component with the Pokemon ID from the URL.
 */

import PokemonDetailPage from "./PokemonDetailPage";

interface PokemonDetailPageProps {
  params: { id: string };
}

export default function PokemonDetailPageEntry({ params }: PokemonDetailPageProps) {
  return <PokemonDetailPage params={params} />;
}