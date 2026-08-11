import { categories } from '../data/products';
import type { Product } from '../types';

interface CategoryFiltersProps {
  active: Product['category'] | 'All';
  onChange: (category: Product['category'] | 'All') => void;
  resultCount: number;
}

export default function CategoryFilters({ active, onChange, resultCount }: CategoryFiltersProps) {
  return (
    <div className="filters">
      <div className="filters__chips" role="group" aria-label="Filter by roast">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`filter-chip${active === category ? ' filter-chip--active' : ''}`}
            onClick={() => onChange(category)}
            aria-pressed={active === category}
          >
            {category}
          </button>
        ))}
      </div>
      <p className="filters__count">
        {resultCount} {resultCount === 1 ? 'roast' : 'roasts'}
      </p>
    </div>
  );
}
