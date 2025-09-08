/**
 * Pokemon Modal Page Entry Point
 * 
 * This file serves as the entry point for the Pokemon modal overlay.
 * It renders the PokemonModalPage component when accessed via intercepting routes.
 */

import PokemonModalPage from "./pokemon-modal-page";

interface PokemonModalPageProps {
  params: Promise<{ id: string }>;
}

export default function PokemonModalPageEntry({ params }: PokemonModalPageProps) {
  return <PokemonModalPage params={params} />;
}