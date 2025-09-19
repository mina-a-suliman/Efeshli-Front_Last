// src/app/core/models/product.model.ts

export interface ApiResponse<T> {
  statusCode: number;
  succeeded: boolean;
  message: string;
  errors: any;
  data: T;
}

export interface ProductImage {
  url: string;
}

export interface Fabric {
  colorId: number;
  name: string;
  imageUrl: string;
}

export interface Wood {
  colorId: number;
  name: string;
  imageUrl: string;
}

export interface ProductSpecification {
  name: string;
  value: string;
}

export interface Iproduct {
  productId: number;
  name: string;
  description: string;
  brand: string;
  brandId: number;
  dimensionsOrSize: string;
  sku: string;
  category: string;
  categoryId: number;
  model_3D: string | null;
  mainPrice: number;
  mainFinalPrice: number;
  mainDiscount: number;
  isWishlisted: boolean;
  productImages: string[];
  fabrics: Fabric[];
  woods: Wood[];
  productSpecification: ProductSpecification[];
  
  // Computed properties for UI compatibility
  images?: string[];
  price?: number;
  vatIncluded?: boolean;
  madeToOrder?: boolean;
  deliveryMinDays?: number;
  deliveryMaxDays?: number;
  additionalInfo?: string;
  shippingReturn?: string;
  specs?: {[key: string]: string};
}