# CLAUDE.MD

This file provides context and guidelines for working with this repository using Claude Code.

## Project Overview

Ember & Ash is a specialty coffee e-commerce storefront demo. It features six sample
single-origin/blend coffees with search, category (roast level) filters, a product
detail view, a cart with quantity controls, and a simulated multi-step checkout
(shipping → payment → review → confirmation). No real payment processing occurs.

## Repository Structure

```
.
├── index.html
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx                # Top-level layout, filtering/search state
│   ├── App.css                 # All component styling
│   ├── index.css                # Global tokens/reset
│   ├── types.ts                   # Product & cart types
│   ├── data/products.ts            # Six sample products
│   ├── context/CartContext.tsx      # Cart state (localStorage-backed)
│   └── components/                   # Header, Hero, ProductCard/Grid,
│                                       ProductDetailModal, CartDrawer,
│                                       Checkout, CategoryFilters, etc.
└── public/favicon.svg
```

## Development Setup

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
npm install
```

### Running the Project
```bash
npm run dev       # start Vite dev server
npm run build      # type-check + production build
npm run preview      # preview the production build
```

## Development Guidelines

### Code Style
- TypeScript + React function components, no class components.
- Styling is plain CSS in `src/App.css` (design tokens in `src/index.css`), no CSS-in-JS.
- Product illustrations are inline SVG (`ProductArt.tsx`) — no external image assets.

### Testing
No automated test suite yet. Verify UI changes by running `npm run dev` and checking
both desktop and mobile viewport widths.

### Building
```bash
npm run build
```

### Linting
```bash
npm run lint   # oxlint
```

## Architecture

### Key Components
- `CartContext` — cart line items, quantity updates, subtotal, persisted to `localStorage`.
- `App.tsx` — owns search query, active category filter, selected product (for modal),
  and checkout-open state.
- `Checkout.tsx` — self-contained multi-step simulated checkout flow.

### Design Patterns
- Single global stylesheet (`App.css`) rather than CSS modules, for simplicity at this scale.
- Product "photos" are generated SVGs colored per-product rather than image assets.

## Notes for Claude Code

### Important Conventions
- Keep the checkout simulated — do not wire up real payment processing.
- Prefer editing `App.css` for styling changes over introducing a new styling approach.

---

*Last updated: 2026-08-11*
