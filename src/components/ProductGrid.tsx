import type { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onView: (id: string) => void;
}

export default function ProductGrid({ products, onView }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <h3>No roasts match your search</h3>
        <p>Try a different origin, tasting note, or roast level.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onView={onView} />
      ))}
    </div>
  );
}
