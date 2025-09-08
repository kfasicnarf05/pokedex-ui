Pokédex Resource Explorer — Next.js (App Router) + TypeScript

## Getting Started

Install and run the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:3000 and you land straight on the Pokédex.

Routes

- `/pokemon` — Pokédex list with search, filters, sort, pagination
- `/pokemon/[id]` — detail page with artwork, types and stats
- `/favorites` — your starred Pokémon

## Features

- Debounced search (350ms) with smooth pagination
- Full‑dex search: I fetch a compact list once so search works across pages
- Type filter chips with reference colors and hover/active states
- Sort by number, name (A–Z/Z–A) or Favorites
- Favorites with optimistic star toggle persisted in `localStorage`
- Detail view includes Pokéball, dex number, name, types, and stats
- Cancellable fetches with `AbortController`, loading skeleton, retry on error
- All styles use CSS Modules (no inline styles)

## Tech

- Next.js App Router (server rendering on detail pages)
- TypeScript with strict linting
- CSS Modules for all styling
- Native `fetch` + `AbortController`

## Constants & variables

- `PAGE_SIZE` — items per page. Find it in `src/app/pokemon/page.tsx` near the top. Default: 24.
- `apiUrl` — memoized URL for the current page fetch. Same file.
- `debounced` — debounced search term state.
- `allList` — one‑time cached list of all Pokémon (name + URL) so search/filters span the whole dex.
- `typeMapRef` — in‑memory cache mapping Pokémon name → Set of types. Populated as cards are fetched.
- `typeFilter` — currently selected type chip.
- `sortBy` — current sort mode: `number`, `name`, `name-desc`, or `favorites`.
- `filtered` — derived list after applying search, type/favorites filters and sort.

You'll find all of these in `src/app/pokemon/page.tsx`. Detail view types and styling live in `src/app/pokemon/[id]/`.

## Notes

- I kept the UI close to the provided reference (glassy header, gradient backdrop, colored chips).
- If I had more time: URL‑synced state (q, type, sort, page), TanStack Query caching, and a theme toggle.
