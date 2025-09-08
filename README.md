# Pokemon Resource Explorer

A modern, responsive Pokemon exploration app built with Next.js 15, TypeScript, and CSS Modules. Features real-time search, filtering, sorting, and detailed Pokemon information with modal overlays.

## 🚀 Features

### Core Features
- **Pokemon List View**: Paginated grid display with 20 Pokemon per page
- **Search**: Real-time search with 300ms debouncing
- **Type Filtering**: Filter Pokemon by type with visual type chips
- **Sorting**: Sort by Pokédex number, name, or favorites
- **Favorites**: Toggle and persist favorites using localStorage
- **Modal Details**: Click Pokemon cards to view details in modal overlay
- **URL Navigation**: Direct URL access to individual Pokemon pages
- **Responsive Design**: Mobile-first design with CSS Grid and Flexbox

### Technical Features
- **Next.js 15 App Router**: Modern routing with intercepting routes
- **TypeScript**: Full type safety throughout the application
- **CSS Modules**: Scoped styling with type-specific color coding
- **Custom Hooks**: Reusable logic for data fetching, filtering, and state management
- **Error Handling**: Graceful error states and retry mechanisms
- **Loading States**: Skeleton loading and transition animations
- **Accessibility**: Semantic HTML, ARIA labels, and keyboard navigation

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: CSS Modules
- **Data Source**: PokeAPI (https://pokeapi.co)
- **State Management**: React hooks and localStorage
- **Build Tool**: Turbopack (Next.js)

## 📁 Project Structure

```
src/
├── app/
│   ├── @modal/                    # Intercepting routes for modals
│   │   └── (.)pokemon/[id]/
│   ├── pokemon/
│   │   ├── [id]/                 # Dynamic Pokemon detail pages
│   │   ├── components/           # Reusable components
│   │   ├── hooks/                # Custom hooks
│   │   └── *.tsx                 # Page components
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── public/                       # Static assets
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pokedex-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## 🎯 Usage

### Navigation
- **Home**: Redirects to Pokemon list (`/pokemon`)
- **Pokemon List**: Browse all Pokemon with pagination
- **Search**: Type in search bar to filter Pokemon by name
- **Type Filter**: Click type chips to filter by Pokemon type
- **Sort**: Use dropdown to sort by number, name, or favorites
- **Favorites**: Click star icon to toggle favorites
- **Details**: Click Pokemon card to view details in modal

### Keyboard Navigation
- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close modal overlays

## 🔧 Custom Hooks

### usePokemonData
Fetches Pokemon list data with pagination and loading states.

### usePokemonFilters
Manages search, type filtering, and sorting state with URL synchronization.

### usePokemonSearch
Handles search logic with debouncing and filtering.

### useFavorites
Manages favorites state with localStorage persistence and real-time updates.

### useScrollRestoration
Preserves scroll position during navigation and modal interactions.

## 🎨 Styling

### CSS Modules
- Scoped styles prevent conflicts
- Type-specific color coding for Pokemon types
- Responsive design with mobile-first approach
- Smooth animations and transitions

### Type Colors
Each Pokemon type has a unique color scheme:
- Fire: Orange (#F08030)
- Water: Blue (#6890F0)
- Grass: Green (#78C850)
- Electric: Yellow (#F8D030)
- And more...

## 📱 Responsive Design

- **Mobile**: Single column layout with touch-friendly interactions
- **Tablet**: Two-column grid with optimized spacing
- **Desktop**: Multi-column grid with hover effects

## 🔍 API Integration

### PokeAPI Endpoints
- **Pokemon List**: `/pokemon?limit=20&offset={page}`
- **Pokemon Details**: `/pokemon/{id}`
- **Pokemon Types**: `/type/{type}`

### Error Handling
- Network error retry mechanisms
- Graceful fallbacks for missing data
- Loading states for better UX

## 🚀 Deployment

The app is ready for deployment on platforms like:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Railway**

### Environment Variables
No environment variables required - uses public PokeAPI.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **PokeAPI** for providing comprehensive Pokemon data
- **Next.js** team for the excellent framework
- **Pokemon Company** for the amazing Pokemon universe