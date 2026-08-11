export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero__inner">
        <div className="hero__content">
          <span className="hero__eyebrow">Small-batch · Roasted to order</span>
          <h1>
            Coffee, brewed with <em>intention</em>.
          </h1>
          <p>
            We source exceptional single-origin lots and roast in small batches each week, so every bag
            arrives at its peak. Six coffees, six stories.
          </p>
          <a className="btn btn--primary btn--lg" href="#shop">
            Shop the Collection
          </a>
        </div>
        <div className="hero__art" aria-hidden="true">
          <svg viewBox="0 0 280 280" className="hero__svg">
            <circle cx="140" cy="140" r="130" fill="var(--color-accent-soft)" />
            <circle cx="140" cy="140" r="96" fill="var(--color-bg-alt)" />
            <g transform="translate(70,60)">
              <ellipse cx="70" cy="140" rx="60" ry="14" fill="rgba(60,36,21,0.12)" />
              <path
                d="M20 20h100l8 16a20 20 0 0 1 0 26l-5 66a14 14 0 0 1-14 13H31a14 14 0 0 1-14-13L12 62a20 20 0 0 1 0-26z"
                fill="var(--color-primary)"
              />
              <path d="M45 20c0-11 7-19 25-19s25 8 25 19" fill="none" stroke="var(--color-accent)" strokeWidth="5" />
              <rect x="12" y="14" width="116" height="14" rx="5" fill="var(--color-accent)" />
              <path
                d="M118 30h4a16 16 0 0 1 0 32h-4v-8h4a8 8 0 0 0 0-16h-4v-8z"
                fill="var(--color-primary)"
              />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
