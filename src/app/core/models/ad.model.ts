// src/app/core/models/ad.model.ts
export interface AdProduct {
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

export interface AdResponse {
  items: AdProduct[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdApiResponse {
  statusCode: string;
  succeeded: boolean;
  message: string;
  errors: any;
  data: AdResponse;
}