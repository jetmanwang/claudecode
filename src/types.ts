export type RoastLevel = 'Light Roast' | 'Medium Roast' | 'Dark Roast';

export type ProductType = 'Single Origin' | 'Blend';

export interface Product {
  id: string;
  name: string;
  origin: string;
  category: RoastLevel;
  type: ProductType;
  price: number;
  weightOz: number;
  rating: number;
  reviewCount: number;
  tastingNotes: string[];
  process: string;
  altitude: string;
  description: string;
  story: string;
  palette: [string, string];
  accent: string;
  initials: string;
}

export interface CartLine {
  productId: string;
  quantity: number;
}
