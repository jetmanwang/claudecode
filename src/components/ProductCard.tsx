import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import ProductArt from './ProductArt';
import StarRating from './StarRating';

interface ProductCardProps {
  product: Product;
  onView: (id: string) => void;
}

export default function ProductCard({ product, onView }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <article className="product-card">
      <button
        type="button"
        className="product-card__art"
        onClick={() => onView(product.id)}
        aria-label={`View details for ${product.name}`}
      >
        <ProductArt product={product} className="product-card__svg" />
        <span className="product-card__type">{product.type}</span>
      </button>

      <div className="product-card__body">
        <button type="button" className="product-card__title-btn" onClick={() => onView(product.id)}>
          <h3 className="product-card__title">{product.name}</h3>
        </button>
        <p className="product-card__origin">{product.origin}</p>
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        <p className="product-card__notes">{product.tastingNotes.join(' · ')}</p>

        <div className="product-card__footer">
          <span className="product-card__price">${product.price.toFixed(2)}</span>
          <button type="button" className="btn btn--primary btn--sm" onClick={() => addItem(product.id)}>
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}
