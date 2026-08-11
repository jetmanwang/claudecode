import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import ProductArt from './ProductArt';
import StarRating from './StarRating';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setJustAdded(false);
  }, [product.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleAdd = () => {
    addItem(product.id, quantity);
    setJustAdded(true);
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="modal product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close product details">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="product-modal__art">
          <ProductArt product={product} className="product-modal__svg" />
        </div>

        <div className="product-modal__content">
          <span className="badge">
            {product.category} · {product.type}
          </span>
          <h2 id="product-modal-title">{product.name}</h2>
          <p className="product-modal__origin">{product.origin}</p>
          <StarRating rating={product.rating} reviewCount={product.reviewCount} size={16} />

          <p className="product-modal__description">{product.description}</p>

          <dl className="product-modal__meta">
            <div>
              <dt>Tasting Notes</dt>
              <dd>{product.tastingNotes.join(', ')}</dd>
            </div>
            <div>
              <dt>Process</dt>
              <dd>{product.process}</dd>
            </div>
            <div>
              <dt>Altitude</dt>
              <dd>{product.altitude}</dd>
            </div>
            <div>
              <dt>Bag Size</dt>
              <dd>{product.weightOz} oz</dd>
            </div>
          </dl>

          <p className="product-modal__story">{product.story}</p>

          <div className="product-modal__actions">
            <div className="qty-stepper" role="group" aria-label="Select quantity">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                −
              </button>
              <span aria-live="polite">{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => Math.min(20, q + 1))} aria-label="Increase quantity">
                +
              </button>
            </div>
            <button type="button" className="btn btn--primary btn--lg" onClick={handleAdd}>
              {justAdded ? 'Added ✓' : `Add to Cart — $${(product.price * quantity).toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
