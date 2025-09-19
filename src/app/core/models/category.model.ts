export interface Category {
  categoryId: number;
  name: string;
  imageUrl: string | null;
  hasSubCategories: boolean;
}