import { useEffect } from 'react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import ProductArt from './ProductArt';

interface CartDrawerProps {
  onCheckout: () => void;
}

const FREE_SHIPPING_THRESHOLD = 35;

export default function CartDrawer({ onCheckout }: CartDrawerProps) {
  const { lines, subtotal, isOpen, closeCart, setQuantity, removeItem } = useCart();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCart();
    };
    if (isOpen) {
      document.addEventListener('keydown', onKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div className="modal-overlay" onMouseDown={closeCart}>
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="cart-drawer__header">
          <h2>Your Cart</h2>
          <button type="button" className="modal__close" onClick={closeCart} aria-label="Close cart">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="cart-drawer__empty">
            <p>Your cart is empty.</p>
            <button type="button" className="btn btn--secondary" onClick={closeCart}>
              Browse Roasts
            </button>
          </div>
        ) : (
          <>
            <div className="cart-drawer__shipping">
              {remaining > 0 ? (
                <p>
                  Add <strong>${remaining.toFixed(2)}</strong> more for free shipping
                </p>
              ) : (
                <p className="cart-drawer__shipping--met">✓ You've unlocked free shipping</p>
              )}
              <div className="progress-bar">
                <div
                  className="progress-bar__fill"
                  style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                />
              </div>
            </div>

            <ul className="cart-drawer__list">
              {lines.map((line) => {
                const product = products.find((p) => p.id === line.productId);
                if (!product) return null;
                return (
                  <li key={line.productId} className="cart-line">
                    <div className="cart-line__art">
                      <ProductArt product={product} />
                    </div>
                    <div className="cart-line__info">
                      <div className="cart-line__top">
                        <p className="cart-line__name">{product.name}</p>
                        <button
                          type="button"
                          className="cart-line__remove"
                          onClick={() => removeItem(product.id)}
                          aria-label={`Remove ${product.name} from cart`}
                        >
                          Remove
                        </button>
                      </div>
                      <p className="cart-line__origin">{product.weightOz} oz</p>
                      <div className="cart-line__bottom">
                        <div className="qty-stepper qty-stepper--sm" role="group" aria-label={`Quantity for ${product.name}`}>
                          <button
                            type="button"
                            onClick={() => setQuantity(product.id, line.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span aria-live="polite">{line.quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQuantity(product.id, line.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="cart-line__price">${(product.price * line.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="cart-drawer__footer">
              <div className="cart-drawer__subtotal">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <p className="cart-drawer__note">Shipping and taxes calculated at checkout.</p>
              <button
                type="button"
                className="btn btn--primary btn--lg btn--block"
                onClick={() => {
                  closeCart();
                  onCheckout();
                }}
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
