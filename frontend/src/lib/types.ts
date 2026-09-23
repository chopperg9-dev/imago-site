export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  price: number;
  image: string;
  difficulty: string;
  height_cm: number;
  featured: boolean;
  in_stock: boolean;
  includes: string[];
}

export interface SuperheroJob {
  id: string;
  status: string;
  stage: string;
  stage_label: string;
  progress: number;
  child_name: string;
  cape: string;
  pose: string;
  price: number;
  preview_url: string | null;
  approved: boolean;
}

export interface OrderResult {
  id: string;
  order_number: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
}
