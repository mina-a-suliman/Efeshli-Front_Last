// src/app/core/models/brand.model.ts
export interface Brand {
  brandId: number;
  name: string;
  imageUrl: string | null;
}

export interface ApiResponse<T> {
  statusCode: number;
  succeeded: boolean;
  message: string;
  errors: any;
  data: T;
}
