import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface ApiResponse<T> {
  statusCode: string;
  succeeded: boolean;
  message: string;
  errors: any;
  data: T;
}

export interface ProductsData {
  items: Product[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Product {
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
  
  // Additional properties for compatibility
  id?: number;
  size?: string;
  originalPrice?: number;
  colors?: string[];
  isInWishlist?: boolean;
}

export interface Category {
  categoryId: number;
   id?: number;
  name: string;
  parentId?: number;
  children?: Category[];
  hasSubCategories?: boolean;
  hasSubcategories?: boolean; 
  expanded?: boolean; // For UI state
  
}

export interface Brand {
  brandId: number;
  name: string;
}

export interface FabricColor {
  fabricColorId: number;
  name: string;
  hexCode?: string;
}

export interface WoodColor {
  woodColorId: number;
  name: string;
  hexCode?: string;
}

export interface AvailableFilters {
  brands: Brand[];
  fabricColors: FabricColor[];
  woodColors: WoodColor[];
  sortOptions: SortOption[];
}

export interface SortOption {
  value: string;
  label: string;
}

export interface ProductFilterRequest {
  keyword?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
  brandIds?: number[];
  fabricColorId?: number;
  woodColorId?: number;
}

export interface FilterState {
  selectedCategoryId: number | null;
  selectedBrandIds: number[];
  selectedFabricColorId: number | null;
  selectedWoodColorId: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: string;
  keyword: string;
  pageNumber: number;
  pageSize: number;
}
export interface Category {
  categoryId: number;
  name: string;
  imageUrl?: string;
  hasSubCategories?: boolean;
  parentId?: number;
  children?: Category[];
  expanded?: boolean; // For UI state
}
@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private baseUrl = 'https://efreshli.runasp.net/api';

  // Filter state subjects
  private filterStateSubject = new BehaviorSubject<FilterState>({
    selectedCategoryId: null,
    selectedBrandIds: [],
    selectedFabricColorId: null,
    selectedWoodColorId: null,
    minPrice: null,
    maxPrice: null,
    sortBy: 'Recommended',
    keyword: '',
    pageNumber: 1,
    pageSize: 24
  });
 
  // Observables for components to subscribe to
  public filterState$ = this.filterStateSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get current filter state
  getCurrentFilterState(): FilterState {
    return this.filterStateSubject.value;
  }

  // Update filter state
  updateFilterState(updates: Partial<FilterState>): void {
    const currentState = this.getCurrentFilterState();
    const newState = { ...currentState, ...updates };
    
    // Reset page number when filters change (except when explicitly setting page)
    if (!updates.pageNumber && (updates.selectedCategoryId !== undefined || 
        updates.selectedBrandIds !== undefined || updates.selectedFabricColorId !== undefined ||
        updates.selectedWoodColorId !== undefined || updates.minPrice !== undefined ||
        updates.maxPrice !== undefined || updates.sortBy !== undefined || updates.keyword !== undefined)) {
      newState.pageNumber = 1;
    }
    
    this.filterStateSubject.next(newState);
  }

  // Reset all filters
  resetFilters(): void {
    this.filterStateSubject.next({
      selectedCategoryId: null,
      selectedBrandIds: [],
      selectedFabricColorId: null,
      selectedWoodColorId: null,
      minPrice: null,
      maxPrice: null,
      sortBy: 'Recommended',
      keyword: '',
      pageNumber: 1,
      pageSize: 24
    });
  }

  // API Endpoints

  // Get all categories
  getCategories(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(`${this.baseUrl}/Filter/categories`)
      .pipe(
        map(response => {
          if (response.succeeded && response.data) {
            return response.data.map(cat => ({
              ...cat,
              expanded: false // Add UI state
            }));
          }
          throw new Error(response.message || 'Failed to fetch categories');
        })
      );
  }
getSubCategories(pid: number): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(`https://efreshli.runasp.net/api/Category/Categories/${pid}`)
      .pipe(
        map(response => {
          if (response.succeeded && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch subcategories');
        })
      );
  }
  // Get brands by category
  getBrandsByCategory(categoryId: number): Observable<Brand[]> {
    const params = new HttpParams().set('categoryId', categoryId.toString());
    return this.http.get<ApiResponse<Brand[]>>(`${this.baseUrl}/Filter/brands`, { params })
      .pipe(
        map(response => {
          if (response.succeeded && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch brands');
        })
      );
  }

  // Get fabric colors by category
  getFabricColorsByCategory(categoryId: number): Observable<FabricColor[]> {
    const params = new HttpParams().set('categoryId', categoryId.toString());
    return this.http.get<ApiResponse<FabricColor[]>>(`${this.baseUrl}/Filter/fabriccolors`, { params })
      .pipe(
        map(response => {
          if (response.succeeded && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch fabric colors');
        })
      );
  }

  // Get wood colors by category
  getWoodColorsByCategory(categoryId: number): Observable<WoodColor[]> {
    const params = new HttpParams().set('categoryId', categoryId.toString());
    return this.http.get<ApiResponse<WoodColor[]>>(`${this.baseUrl}/Filter/woodcolors`, { params })
      .pipe(
        map(response => {
          if (response.succeeded && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch wood colors');
        })
      );
  }

  // Get all available filters for a category
  getAvailableFilters(categoryId: number): Observable<AvailableFilters> {
    const params = new HttpParams().set('categoryId', categoryId.toString());
    return this.http.get<ApiResponse<AvailableFilters>>(`${this.baseUrl}/Filter/filters`, { params })
      .pipe(
        map(response => {
          if (response.succeeded && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch available filters');
        })
      );
  }

  // Get filtered products
  // In your filter.service.ts
getFilteredProducts(filterRequest: any = {}): Observable<ProductsData> {
  let params = new HttpParams();
  Object.keys(filterRequest).forEach(key => {
    if (filterRequest[key] !== null && filterRequest[key] !== undefined) {
      if (Array.isArray(filterRequest[key])) {
        filterRequest[key].forEach((value: any) => {
          params = params.append(key, value.toString());
        });
      } else {
        params = params.append(key, filterRequest[key].toString());
      }
    }
  });

  // Add basic parameters
  params = params.set('pageNumber', (filterRequest.pageNumber || 1).toString());
  params = params.set('pageSize', (filterRequest.pageSize || 24).toString());
  
  if (filterRequest.sortBy) {
    params = params.set('sortBy', filterRequest.sortBy);
  }

  return this.http.get<ApiResponse<ProductsData>>(`${this.baseUrl}/Filter/filter`, { params })
    .pipe(
      map(response => {
        if (response.succeeded && response.data) {
          const transformedItems = response.data.items.map(item => ({
            ...item,
            id: item.productId,
            size: item.dimensionsOrSize,
            originalPrice: item.price,
            colors: item.productItemColorsUrls,
            isInWishlist: item.isWishlisted
          }));

          return {
            ...response.data,
            items: transformedItems
          };
        }
        throw new Error(response.message || 'Failed to fetch products');
      })
    );
}

  // Execute filter request
  private executeFilterRequest(filterRequest: ProductFilterRequest): Observable<ProductsData> {
    let params = new HttpParams();

    // Add all parameters
    if (filterRequest.keyword) {
      params = params.set('keyword', filterRequest.keyword);
    }
    
    params = params.set('pageNumber', (filterRequest.pageNumber || 1).toString());
    params = params.set('pageSize', (filterRequest.pageSize || 24).toString());
    
    if (filterRequest.sortBy) {
      params = params.set('sortBy', filterRequest.sortBy);
    }
    
    if (filterRequest.minPrice !== undefined && filterRequest.minPrice !== null) {
      params = params.set('minPrice', filterRequest.minPrice.toString());
    }
    
    if (filterRequest.maxPrice !== undefined && filterRequest.maxPrice !== null) {
      params = params.set('maxPrice', filterRequest.maxPrice.toString());
    }
    
    if (filterRequest.categoryId) {
      params = params.set('categoryId', filterRequest.categoryId.toString());
    }
    
    // Handle array of brand IDs
    if (filterRequest.brandIds && filterRequest.brandIds.length > 0) {
      filterRequest.brandIds.forEach(brandId => {
        params = params.append('brandIds', brandId.toString());
      });
    }
    
    if (filterRequest.fabricColorId) {
      params = params.set('fabricColorId', filterRequest.fabricColorId.toString());
    }
    
    if (filterRequest.woodColorId) {
      params = params.set('woodColorId', filterRequest.woodColorId.toString());
    }

    return this.http.get<ApiResponse<ProductsData>>(`${this.baseUrl}/Filter/filter`, { params })
      .pipe(
        map(response => {
          if (response.succeeded && response.data) {
            // Transform products to match your interface
            const transformedItems = response.data.items.map(item => ({
              ...item,
              id: item.productId,
              size: item.dimensionsOrSize,
              originalPrice: item.price,
              colors: item.productItemColorsUrls,
              isInWishlist: item.isWishlisted
            }));

            return {
              ...response.data,
              items: transformedItems
            };
          }
          throw new Error(response.message || 'Failed to fetch products');
        })
      );
  }
  // إضافة دالة جديدة للـ collections
getCollectionProducts(collection: string, pageNumber: number = 1, pageSize: number = 24): Observable<ProductsData> {
  console.log('🔍 FilterService - Loading collection:', { collection, pageNumber, pageSize });
  
  const params = new HttpParams()
    .set('pageNumber', pageNumber.toString())
    .set('pageSize', pageSize.toString());
  
  const url = `${this.baseUrl}/Collections/${collection}`;
  console.log('🔗 Collection API URL:', `${url}?${params.toString()}`);
  
  return this.http.get<ApiResponse<ProductsData>>(url, { params })
    .pipe(
      map(response => {
        console.log('📦 Collection API response:', response);
        
        if (response.succeeded && response.data) {
          console.log('✅ Collection response processed successfully');
          
          // تحويل البيانات لتتماشى مع الشكل المطلوب
          const transformedItems = response.data.items.map(item => ({
            ...item,
            id: item.productId,
            size: item.dimensionsOrSize,
            originalPrice: item.price,
            colors: item.productItemColorsUrls,
            isInWishlist: item.isWishlisted
          }));

          return {
            ...response.data,
            items: transformedItems
          };
        }
        throw new Error(response.message || 'Failed to fetch collection products');
      })
    );
}
// في filter.service.ts
getBrands(categoryId?: number): Observable<any[]> {
  console.log('🔍 FilterService - Loading brands for categoryId:', categoryId);
  
  let params = new HttpParams();
  if (categoryId) {
    params = params.set('categoryId', categoryId.toString());
  }
  
  const url = `${this.baseUrl}/Filter/brands`;
  console.log('🔗 Brands API URL:', `${url}?${params.toString()}`);
  
  return this.http.get<ApiResponse<any[]>>(url, { params })
    .pipe(
      map(response => {
        console.log('📦 Brands API response:', response);
        
        if (response.succeeded && response.data) {
          console.log('✅ Brands response processed successfully');
          return response.data;
        }
        throw new Error(response.message || 'Failed to fetch brands');
      })
    );
}
// في filter.service.ts - أضف هذه الدالة
getFabricColors(categoryId?: number): Observable<any[]> {
  console.log('🔍 FilterService - Loading fabric colors for categoryId:', categoryId);
  
  let params = new HttpParams();
  if (categoryId) {
    params = params.set('categoryId', categoryId.toString());
  }
  
  const url = `${this.baseUrl}/Filter/Fabriccolors`;
  console.log('🔗 Fabric Colors API URL:', `${url}?${params.toString()}`);
  
  return this.http.get<ApiResponse<any[]>>(url, { params })
    .pipe(
      map(response => {
        console.log('📦 Fabric Colors API response:', response);
        
        if (response.succeeded && response.data) {
          console.log('✅ Fabric Colors response processed successfully');
          return response.data;
        }
        throw new Error(response.message || 'Failed to fetch fabric colors');
      })
    );
}
// في filter.service.ts - أضف هذه الدالة
getWoodColors(categoryId?: number): Observable<any[]> {
  console.log('🔍 FilterService - Loading wood colors for categoryId:', categoryId);
  
  let params = new HttpParams();
  if (categoryId) {
    params = params.set('categoryId', categoryId.toString());
  }
  
  const url = `${this.baseUrl}/Filter/Woodcolors`;
  console.log('🔗 Wood Colors API URL:', `${url}?${params.toString()}`);
  
  return this.http.get<ApiResponse<any[]>>(url, { params })
    .pipe(
      map(response => {
        console.log('📦 Wood Colors API response:', response);
        
        if (response.succeeded && response.data) {
          console.log('✅ Wood Colors response processed successfully');
          return response.data;
        }
        throw new Error(response.message || 'Failed to fetch wood colors');
      })
    );
}
}