// src/app/core/models/room.model.ts
export interface RoomProduct {
  productId: number;
  name: string;
  description: string;
  dimensionsOrSize: string;
  categoryId: number;
  category: string;
  brandId: number;
  price: number;
  finalPrice: number;
  imageUrl: string;
  productItemColorsUrls: string[];
  discount: number;
  isWishlisted: boolean;
}

export interface RoomResponse {
  items: RoomProduct[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface RoomApiResponse {
  statusCode: string;
  succeeded: boolean;
  message: string;
  errors: any;
  data: RoomResponse;
}