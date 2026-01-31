import { Category } from './category.interface';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl?: string;
  category?: Category;
}
