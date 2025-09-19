// src/app/core/models/outdoor.model.ts
export interface OutdoorProduct {
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

export interface OutdoorResponse {
  items: OutdoorProduct[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface OutdoorApiResponse {
  statusCode: string;
  succeeded: boolean;
  message: string;
  errors: any;
  data: OutdoorResponse;
}