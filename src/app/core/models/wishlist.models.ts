//import { ApiResponse } from '../../core/services/auth.service';

export interface ApiResponse<T = any> {
  statusCode: string | number;
  succeeded: boolean;
  message: string;
  errors: any;
  data: T;
}

export interface WishlistDropdownOption {
  wishlistId: number;
  wishlistName: string;
  itemsCount: number;
  isInWishlist?: boolean; // من GetWishlistsDropDown
}

export interface WishlistDto {
  wishlistId: number;
  wishlistName: string;
  itemsCount: number;
  wishlistUrl?: string;
  mainImages?: string[];
  wishlistItemsDto?: WishlistItemDto[]; // عند جلب محتويات الويشليست
}

export interface WishlistItemDto {
  wishlistItemId: number;
  wishlistId: number;
  productId: number;
  name?: string | null;
  category?: string | null;
  description?: string | null;
  dimensionsOrSize?: string | null;
  discount?: number;
  price?: number;
  finalPrice?: number | null;
  imageUrl?: string | null;
  productItemColorsUrls?: string[];
  isWishlisted?: boolean;
}
// Interface لملخص الويشليست (من GET /api/Wishlist)
export interface WishlistSummaryDto {
  wishlistId: number;
  wishlistName: string;
  itemsCount: number;
  wishlistUrl: string;
  mainImages: string[];
}
// طلبات العمليات
export interface AddToWishlistRequest {
  wishlistId: number;
  itemId: number;
}

export interface RemoveFromWishlistRequest {
  wishlistId: number;
  itemId: number;
}

// للإنشاء والتعديل
export interface CreateWishlistRequest {
  name: string;
  isPublic?: boolean;
}

export interface UpdateWishlistRequest {
  wishlistId: number;
  name: string;
  isPublic?: boolean;
}