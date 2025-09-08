# Solutions & Architecture

This document outlines the technical solutions and architectural decisions implemented in the Pokemon Resource Explorer.

## 🏗️ Architecture Overview

### Next.js App Router Structure
```
app/
├── layout.tsx                 # Root layout with header and modal slot
├── page.tsx                   # Home page (redirects to /pokemon)
├── pokemon/
│   ├── page.tsx               # Pokemon list page
│   ├── [id]/
│   │   ├── page.tsx           # Pokemon detail page entry
│   │   └── PokemonDetailPage.tsx
│   ├── components/
│   │   ├── PokemonCard.tsx    # Individual Pokemon card
│   │   └── VirtualizedPokemonList.tsx
│   └── hooks/                 # Custom hooks
└── @modal/
    └── (.)pokemon/[id]/
        └── pokemon-modal-page.tsx
```

## 🔧 Core Solutions

### 1. URL as Source of Truth
**Problem**: Need bookmarkable URLs and direct access to Pokemon details.

**Solution**: 
- Next.js App Router with dynamic routes (`/pokemon/[id]`)
- Intercepting routes (`@modal/(.)pokemon/[id]`) for modal overlays
- URL state synchronization for search, filters, and pagination

**Implementation**:
```typescript
// URL synchronization in usePokemonFilters
const updateURL = useCallback((newParams: URLSearchParams) => {
  const url = new URL(window.location.href);
  url.search = newParams.toString();
  router.replace(url.pathname + url.search);
}, [router]);
```

### 2. Real-time Search with Debouncing
**Problem**: Prevent excessive API calls during typing.

**Solution**: 300ms debounced search with useCallback optimization.

**Implementation**:
```typescript
// Debounced search in usePokemonSearch
useEffect(() => {
  const timeoutId = setTimeout(() => {
    setDebouncedQuery(query);
  }, 300);
  return () => clearTimeout(timeoutId);
}, [query]);
```

### 3. Favorites Management
**Problem**: Persistent favorites with real-time updates across components.

**Solution**: Custom hook with localStorage and event dispatching.

**Implementation**:
```typescript
// useFavorites hook
const toggleFavorite = useCallback((id: string, name: string) => {
  const newFavorites = favorites.has(id) 
    ? new Map([...favorites].filter(([key]) => key !== id))
    : new Map([...favorites, [id, name]]);
  
  setFavorites(newFavorites);
  localStorage.setItem('pokemon-favorites', JSON.stringify([...newFavorites]));
  
  // Dispatch event for real-time updates
  window.dispatchEvent(new CustomEvent('favoritesUpdated'));
}, [favorites]);
```

### 4. Type Filtering
**Problem**: Efficient filtering by Pokemon types with visual feedback.

**Solution**: 
- Type-specific color coding with CSS classes
- Efficient filtering using Map data structure
- Visual type chips with hover effects

**Implementation**:
```typescript
// Type filtering in usePokemonFilters
const filteredPokemon = useMemo(() => {
  return pokemon.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(query.toLowerCase());
    const matchesTypes = typeFilters.length === 0 || 
      p.types.some(type => typeFilters.includes(type.type.name));
    return matchesSearch && matchesTypes;
  });
}, [pokemon, query, typeFilters]);
```

### 5. Modal Overlay System
**Problem**: Show Pokemon details without losing list context.

**Solution**: Next.js intercepting routes with modal overlay.

**Implementation**:
```typescript
// Intercepting route structure
@modal/
└── (.)pokemon/[id]/
    └── pokemon-modal-page.tsx

// Modal component with backdrop
<div className={styles.backdrop}>
  <div className={styles.modal}>
    {/* Pokemon details */}
  </div>
</div>
```

**Design Decision**: Modal backdrop uses the same gradient background as the website (`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`) instead of blurring, creating a cleaner, more cohesive visual experience.

### 6. Scroll Position Preservation
**Problem**: Maintain scroll position during navigation and modal interactions.

**Solution**: Custom hook with sessionStorage and event listeners.

**Implementation**:
```typescript
// useScrollRestoration hook
const saveScrollPosition = () => {
  scrollPositionRef.current[pageKey] = window.scrollY;
  sessionStorage.setItem("scrollPositions", JSON.stringify(scrollPositionRef.current));
};

const restoreScrollPosition = () => {
  const savedPosition = scrollPositionRef.current[pageKey];
  if (savedPosition) {
    window.scrollTo(0, savedPosition);
  }
};
```

### 7. Error Handling & Loading States
**Problem**: Graceful handling of network errors and loading states.

**Solution**: 
- Error boundaries for component-level error handling
- Loading skeletons for better UX
- Retry mechanisms for failed requests

**Implementation**:
```typescript
// Error handling in PokemonCard
if (error) {
  return <div className={styles.error}>Error loading Pokemon</div>;
}

if (loading) {
  return <div className={styles.skeleton}>Loading...</div>;
}
```

## 🎨 Styling Solutions

### CSS Modules Architecture
**Problem**: Scoped styling without conflicts.

**Solution**: CSS Modules with type-specific color coding.

**Implementation**:
```css
/* Type-specific colors */
.fire { background-color: #F08030; }
.water { background-color: #6890F0; }
.grass { background-color: #78C850; }
.electric { background-color: #F8D030; color: #1f2937; }
```

### Responsive Design
**Problem**: Consistent experience across devices.

**Solution**: Mobile-first design with CSS Grid and Flexbox.

**Implementation**:
```css
/* Responsive grid */
.pokemonGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

@media (max-width: 768px) {
  .pokemonGrid {
    grid-template-columns: 1fr;
  }
}
```

## 🔄 State Management

### Custom Hooks Pattern
**Problem**: Reusable state logic across components.

**Solution**: Custom hooks for specific functionality.

**Hooks Implemented**:
- `usePokemonData`: Data fetching and pagination
- `usePokemonFilters`: Search, filtering, and sorting
- `usePokemonSearch`: Search logic with debouncing
- `useFavorites`: Favorites management
- `useScrollRestoration`: Scroll position management

### URL State Synchronization
**Problem**: Keep URL in sync with application state.

**Solution**: Bidirectional synchronization between URL and state.

**Implementation**:
```typescript
// URL to state
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  setQuery(urlParams.get('q') || '');
  setTypeFilters(urlParams.get('types')?.split(',') || []);
  setSort(urlParams.get('sort') || 'number');
}, []);

// State to URL
const updateURL = useCallback((newParams: URLSearchParams) => {
  const url = new URL(window.location.href);
  url.search = newParams.toString();
  router.replace(url.pathname + url.search);
}, [router]);
```

## 🚀 Performance Optimizations

### React.memo Usage
**Problem**: Prevent unnecessary re-renders.

**Solution**: Memoize components that receive stable props.

**Implementation**:
```typescript
export default React.memo(PokemonListPage);
```

### useCallback Optimization
**Problem**: Prevent function recreation on every render.

**Solution**: Memoize callback functions.

**Implementation**:
```typescript
const handlePageChange = useCallback((newPage: number) => {
  saveCurrentPosition();
  setPage(newPage);
  scrollToTop();
}, [saveCurrentPosition, scrollToTop]);
```

### Debounced Search
**Problem**: Reduce API calls during typing.

**Solution**: 300ms debounce with cleanup.

**Implementation**:
```typescript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    setDebouncedQuery(query);
  }, 300);
  return () => clearTimeout(timeoutId);
}, [query]);
```

## 🔒 Data Persistence

### localStorage Integration
**Problem**: Persist user preferences across sessions.

**Solution**: localStorage for favorites with error handling.

**Implementation**:
```typescript
// Save to localStorage with error handling
try {
  localStorage.setItem('pokemon-favorites', JSON.stringify([...favorites]));
} catch (error) {
  console.warn('Failed to save favorites:', error);
}
```

### Session Storage for Scroll Position
**Problem**: Temporary state that should persist during session.

**Solution**: sessionStorage for scroll positions.

**Implementation**:
```typescript
// Save scroll position
sessionStorage.setItem("scrollPositions", JSON.stringify(scrollPositionRef.current));

// Restore scroll position
const savedPositions = sessionStorage.getItem("scrollPositions");
if (savedPositions) {
  scrollPositionRef.current = JSON.parse(savedPositions);
}
```

## 🎯 Accessibility Solutions

### Semantic HTML
**Problem**: Screen reader compatibility.

**Solution**: Proper HTML semantics and ARIA labels.

**Implementation**:
```typescript
<button 
  className={styles.closeButton} 
  onClick={handleClose} 
  aria-label="Close modal"
>
  ×
</button>
```

### Keyboard Navigation
**Problem**: Keyboard accessibility.

**Solution**: Focus management and keyboard event handlers.

**Implementation**:
```typescript
useEffect(() => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      handleClose();
    }
  };
  document.addEventListener("keydown", handleEscape);
  return () => document.removeEventListener("keydown", handleEscape);
}, [handleClose]);
```

## 🔧 Build & Deployment

### Next.js Configuration
**Problem**: Optimize for production.

**Solution**: Custom Next.js configuration.

**Implementation**:
```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['raw.githubusercontent.com'],
  },
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};
```

### Production Optimizations
- Image optimization with Next.js Image component
- CSS optimization with CSS Modules
- JavaScript bundling with Turbopack
- Static generation where possible

## 📊 Monitoring & Analytics

### Error Tracking
**Problem**: Monitor application errors.

**Solution**: Error boundaries and console logging.

**Implementation**:
```typescript
// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
}
```

## 🚀 Future Enhancements

### Potential Improvements
1. **Virtual Scrolling**: For better performance with large lists
2. **Caching**: Implement React Query for better data management
3. **PWA**: Add service worker for offline functionality
4. **Testing**: Add unit and integration tests
5. **Analytics**: Implement user behavior tracking
6. **Internationalization**: Multi-language support

### Scalability Considerations
- Component splitting for better code organization
- Lazy loading for non-critical components
- Image optimization and CDN integration
- Database integration for user preferences
- API rate limiting and caching strategies