/**
 * Pokemon List Page Wrapper Component
 * 
 * This component wraps the PokemonListPage in a Suspense boundary to handle
 * useSearchParams properly during server-side rendering. It provides a loading
 * fallback while the search parameters are being resolved.
 */

"use client";
import { Suspense } from "react";
import PokemonListPage from "./pokemon-list-page";

export default function PokemonListPageWrapper() {
  return (
    <Suspense fallback={<div>Loading Pokemon list...</div>}>
      <PokemonListPage />
    </Suspense>
  );
}
