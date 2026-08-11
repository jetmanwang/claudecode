import { useMemo, useState } from 'react';
import './App.css';
import { CartProvider } from './context/CartContext';
import { products } from './data/products';
import type { Product } from './types';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryFilters from './components/CategoryFilters';
import ProductGrid from './components/ProductGrid';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import Checkout from './components/Checkout';
import Footer from './components/Footer';

function AppShell() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Product['category'] | 'All'>('All');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      if (!matchesCategory) return false;
      if (!query) return true;
      const haystack = [product.name, product.origin, product.category, product.type, ...product.tastingNotes]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [searchQuery, activeCategory]);

  const selectedProduct = selectedProductId ? products.find((p) => p.id === selectedProductId) ?? null : null;

  return (
    <>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main>
        <Hero />
        <section className="shop" id="shop">
          <div className="container">
            <CategoryFilters active={activeCategory} onChange={setActiveCategory} resultCount={filteredProducts.length} />
            <ProductGrid products={filteredProducts} onView={setSelectedProductId} />
          </div>
        </section>
      </main>
      <Footer />

      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProductId(null)} />}
      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
      {checkoutOpen && <Checkout onClose={() => setCheckoutOpen(false)} />}
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppShell />
    </CartProvider>
  );
}
