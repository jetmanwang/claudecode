import type { Product } from '../types';

interface ProductArtProps {
  product: Product;
  className?: string;
}

export default function ProductArt({ product, className }: ProductArtProps) {
  const [from, to] = product.palette;
  const gradientId = `grad-${product.id}`;

  return (
    <svg
      viewBox="0 0 240 240"
      className={className}
      role="img"
      aria-label={`${product.name} coffee bag illustration`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="240" height="240" rx="0" fill="transparent" />
      <g>
        <path
          d="M60 58h120l10 20a26 26 0 0 1 0 34l-6 84a16 16 0 0 1-16 15H72a16 16 0 0 1-16-15l-6-84a26 26 0 0 1 0-34z"
          fill={`url(#${gradientId})`}
        />
        <path d="M92 58c0-14 8-24 28-24s28 10 28 24" fill="none" stroke={to} strokeWidth="6" strokeLinecap="round" />
        <rect x="52" y="52" width="136" height="18" rx="6" fill={to} opacity="0.9" />
        <circle cx="120" cy="146" r="30" fill="rgba(255,251,244,0.92)" />
        <text
          x="120"
          y="154"
          textAnchor="middle"
          fontFamily="'Fraunces', serif"
          fontWeight="600"
          fontSize="22"
          fill={to}
        >
          {product.initials}
        </text>
        <g opacity="0.5">
          <circle cx="80" cy="120" r="3" fill="#fff" />
          <circle cx="96" cy="196" r="3" fill="#fff" />
          <circle cx="160" cy="196" r="3" fill="#fff" />
          <circle cx="164" cy="118" r="3" fill="#fff" />
        </g>
      </g>
    </svg>
  );
}
