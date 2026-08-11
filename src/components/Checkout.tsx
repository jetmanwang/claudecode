import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';

interface CheckoutProps {
  onClose: () => void;
}

type Step = 'shipping' | 'payment' | 'review' | 'confirmation';

const STEPS: { id: Step; label: string }[] = [
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
];

interface ShippingInfo {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface PaymentInfo {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

const SHIPPING_COST = 4.5;
const FREE_SHIPPING_THRESHOLD = 35;
const TAX_RATE = 0.0825;

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function Checkout({ onClose }: CheckoutProps) {
  const { lines, subtotal, clearCart } = useCart();
  const [step, setStep] = useState<Step>('shipping');
  const [orderNumber, setOrderNumber] = useState('');
  const [shipping, setShipping] = useState<ShippingInfo>({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });
  const [payment, setPayment] = useState<PaymentInfo>({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && step !== 'confirmation') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, step]);

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const tax = useMemo(() => subtotal * TAX_RATE, [subtotal]);
  const total = subtotal + shippingCost + tax;

  const orderLines = useMemo(
    () =>
      lines
        .map((line) => {
          const product = products.find((p) => p.id === line.productId);
          return product ? { product, quantity: line.quantity } : null;
        })
        .filter((x): x is { product: (typeof products)[number]; quantity: number } => x !== null),
    [lines],
  );

  const handleShippingSubmit = (event: FormEvent) => {
    event.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = (event: FormEvent) => {
    event.preventDefault();
    setStep('review');
  };

  const handlePlaceOrder = () => {
    const generated = `EA-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumber(generated);
    setStep('confirmation');
    clearCart();
  };

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="modal-overlay" onMouseDown={step === 'confirmation' ? undefined : onClose}>
      <div
        className="modal checkout-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Checkout"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {step !== 'confirmation' && (
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close checkout">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {step !== 'confirmation' && (
          <ol className="checkout-steps">
            {STEPS.map((s, i) => (
              <li
                key={s.id}
                className={`checkout-steps__item${i === stepIndex ? ' checkout-steps__item--active' : ''}${
                  i < stepIndex ? ' checkout-steps__item--done' : ''
                }`}
              >
                <span className="checkout-steps__dot">{i < stepIndex ? '✓' : i + 1}</span>
                {s.label}
              </li>
            ))}
          </ol>
        )}

        {step === 'shipping' && (
          <form className="checkout-form" onSubmit={handleShippingSubmit}>
            <h2>Shipping Details</h2>
            <div className="form-grid">
              <label className="form-field form-field--full">
                Full Name
                <input
                  required
                  value={shipping.name}
                  onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                  placeholder="Jordan Rivera"
                />
              </label>
              <label className="form-field form-field--full">
                Email
                <input
                  required
                  type="email"
                  value={shipping.email}
                  onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                  placeholder="jordan@example.com"
                />
              </label>
              <label className="form-field form-field--full">
                Street Address
                <input
                  required
                  value={shipping.address}
                  onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                  placeholder="123 Roastery Lane"
                />
              </label>
              <label className="form-field">
                City
                <input required value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
              </label>
              <label className="form-field">
                State
                <input required value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} />
              </label>
              <label className="form-field">
                ZIP Code
                <input required value={shipping.zip} onChange={(e) => setShipping({ ...shipping, zip: e.target.value })} />
              </label>
            </div>
            <button type="submit" className="btn btn--primary btn--lg btn--block">
              Continue to Payment
            </button>
          </form>
        )}

        {step === 'payment' && (
          <form className="checkout-form" onSubmit={handlePaymentSubmit}>
            <h2>Payment</h2>
            <p className="checkout-form__hint">This is a simulated checkout — no real payment is processed.</p>
            <div className="form-grid">
              <label className="form-field form-field--full">
                Name on Card
                <input
                  required
                  value={payment.cardName}
                  onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
                  placeholder="Jordan Rivera"
                />
              </label>
              <label className="form-field form-field--full">
                Card Number
                <input
                  required
                  inputMode="numeric"
                  value={payment.cardNumber}
                  onChange={(e) => setPayment({ ...payment, cardNumber: formatCardNumber(e.target.value) })}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                />
              </label>
              <label className="form-field">
                Expiry
                <input
                  required
                  inputMode="numeric"
                  value={payment.expiry}
                  onChange={(e) => setPayment({ ...payment, expiry: formatExpiry(e.target.value) })}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </label>
              <label className="form-field">
                CVC
                <input
                  required
                  inputMode="numeric"
                  value={payment.cvc}
                  onChange={(e) => setPayment({ ...payment, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  placeholder="123"
                  maxLength={4}
                />
              </label>
            </div>
            <div className="checkout-form__actions">
              <button type="button" className="btn btn--secondary" onClick={() => setStep('shipping')}>
                Back
              </button>
              <button type="submit" className="btn btn--primary btn--lg">
                Review Order
              </button>
            </div>
          </form>
        )}

        {step === 'review' && (
          <div className="checkout-form">
            <h2>Review Your Order</h2>

            <ul className="review-list">
              {orderLines.map(({ product, quantity }) => (
                <li key={product.id} className="review-list__item">
                  <span>
                    {product.name} <span className="review-list__qty">× {quantity}</span>
                  </span>
                  <span>${(product.price * quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>

            <div className="review-totals">
              <div>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div>
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div>
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="review-totals__total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="review-address">
              <h4>Shipping to</h4>
              <p>
                {shipping.name}
                <br />
                {shipping.address}
                <br />
                {shipping.city}, {shipping.state} {shipping.zip}
              </p>
              <h4>Payment</h4>
              <p>Card ending in {payment.cardNumber.replace(/\s/g, '').slice(-4) || '••••'}</p>
            </div>

            <div className="checkout-form__actions">
              <button type="button" className="btn btn--secondary" onClick={() => setStep('payment')}>
                Back
              </button>
              <button type="button" className="btn btn--primary btn--lg" onClick={handlePlaceOrder}>
                Place Order — ${total.toFixed(2)}
              </button>
            </div>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="confirmation">
            <div className="confirmation__icon" aria-hidden="true">
              <svg viewBox="0 0 64 64" width="56" height="56">
                <circle cx="32" cy="32" r="32" fill="var(--color-success)" />
                <path
                  d="M20 33l8 8 16-17"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2>Order Confirmed</h2>
            <p className="confirmation__order-number">Order #{orderNumber}</p>
            <p className="confirmation__message">
              Thanks{shipping.name ? `, ${shipping.name.split(' ')[0]}` : ''} — we're roasting your order and will send a
              confirmation to {shipping.email || 'your email'}. This is a simulated order for demo purposes only.
            </p>
            <button type="button" className="btn btn--primary btn--lg" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
