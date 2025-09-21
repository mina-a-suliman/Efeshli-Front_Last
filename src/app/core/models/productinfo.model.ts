export interface ApiResponse<T = any> {
  statusCode: string | number;
  succeeded: boolean;
  message: string;
  errors: any;
  data: T;
}
export interface ProductInfo {
  WishlistItemId?: number;
  wishlistId?: number;
  productId: number;
  name?: string | null;
  dimensionsOrSize?: string | null;
  category?: string | null;
  description?: string | null;
  discount?: number;
  price?: number;
  finalPrice?: number | null;
  imageUrl?: string | null;
  productItemColorsUrls?: string[];
  isWishlisted?: boolean;
}