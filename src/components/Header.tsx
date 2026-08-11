import { useCart } from '../context/CartContext';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const { itemCount, openCart } = useCart();

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a href="#top" className="brand">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" width="34" height="34">
              <rect width="40" height="40" rx="10" fill="var(--color-primary)" />
              <path d="M11 17h18v9a6 6 0 0 1-6 6h-6a6 6 0 0 1-6-6v-9z" fill="var(--color-bg)" />
              <path
                d="M29 18.5h2a3.7 3.7 0 0 1 0 7.4h-2v-2.4h2a1.3 1.3 0 0 0 0-2.6h-2v-2.4z"
                fill="var(--color-bg)"
              />
              <path
                d="M15 10c-1.2 1.2-1.2 2.4 0 3.6M20 10c-1.2 1.2-1.2 2.4 0 3.6M25 10c-1.2 1.2-1.2 2.4 0 3.6"
                stroke="var(--color-accent)"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="brand__text">
            <span className="brand__name">Ember &amp; Ash</span>
            <span className="brand__tag">Specialty Coffee Roasters</span>
          </span>
        </a>

        <div className="site-header__search">
          <svg
            className="site-header__search-icon"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="21" y1="21" x2="16.2" y2="16.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Search beans, origins, notes…"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search products"
          />
        </div>

        <button type="button" className="cart-button" onClick={openCart} aria-label={`Open cart, ${itemCount} items`}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              d="M4 6h2l1.6 10.6A2 2 0 0 0 9.6 18.4h8.1a2 2 0 0 0 2-1.7L21 8H6.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="10" cy="21" r="1.4" fill="currentColor" />
            <circle cx="18" cy="21" r="1.4" fill="currentColor" />
          </svg>
          {itemCount > 0 && <span className="cart-button__badge">{itemCount}</span>}
        </button>
      </div>
    </header>
  );
}
