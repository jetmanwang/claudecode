interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: number;
}

export default function StarRating({ rating, reviewCount, size = 14 }: StarRatingProps) {
  const stars = [0, 1, 2, 3, 4];

  return (
    <div className="star-rating" aria-label={`Rated ${rating} out of 5`}>
      <span className="star-rating__stars" aria-hidden="true">
        {stars.map((i) => {
          const fill = Math.max(0, Math.min(1, rating - i));
          return (
            <span key={i} className="star-rating__star" style={{ width: size, height: size }}>
              <svg viewBox="0 0 24 24" width={size} height={size}>
                <defs>
                  <linearGradient id={`star-fill-${i}-${rating}-${reviewCount ?? 0}`}>
                    <stop offset={`${fill * 100}%`} stopColor="var(--color-accent)" />
                    <stop offset={`${fill * 100}%`} stopColor="var(--color-border)" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2.5l2.9 6.1 6.6.7-4.9 4.5 1.3 6.6L12 16.9l-5.9 3.5 1.3-6.6-4.9-4.5 6.6-.7z"
                  fill={`url(#star-fill-${i}-${rating}-${reviewCount ?? 0})`}
                />
              </svg>
            </span>
          );
        })}
      </span>
      {reviewCount !== undefined && <span className="star-rating__count">{reviewCount} reviews</span>}
    </div>
  );
}
