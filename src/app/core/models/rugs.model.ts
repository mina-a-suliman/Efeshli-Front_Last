// src/app/core/models/rugs.model.ts
export interface RugsProduct {
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

export interface RugsResponse {
  items: RugsProduct[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface RugsApiResponse {
  statusCode: string;
  succeeded: boolean;
  message: string;
  errors: any;
  data: RugsResponse;
}