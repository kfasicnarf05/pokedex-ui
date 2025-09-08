/**
 * Pokemon List Page Entry Point - Made by KFAquinoDev
 * 
 * This file serves as the entry point for the Pokemon list page.
 * It wraps the PokemonListPageWrapper component in a Suspense boundary
 * to handle useSearchParams properly during server-side rendering.
 */

import { Suspense } from "react";
import PokemonListPageWrapper from "./pokemon-list-page-wrapper";

export default function PokemonListPage() {
  return (
    <Suspense fallback={<div>Loading Pokemon list...</div>}>
      <PokemonListPageWrapper />
    </Suspense>
  );
}
