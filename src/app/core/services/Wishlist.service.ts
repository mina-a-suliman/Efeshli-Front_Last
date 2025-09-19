//====================== Wishlist Service ======================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of,Subject } from 'rxjs';
import { catchError, filter,map, tap,takeUntil,delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService, ApiResponse } from '../../core/services/auth.service';

import {
  //ApiResponse,
  WishlistDto,
  WishlistItemDto,
  WishlistDropdownOption,
  WishlistSummaryDto,
  CreateWishlistRequest,
  UpdateWishlistRequest
} from '../models/wishlist.models';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private apiUrl = `${environment.apiUrl}`;

  private userWishlistsSummarySubject = new BehaviorSubject<WishlistSummaryDto[]>([]);
  public userWishlistsSummary$ = this.userWishlistsSummarySubject.asObservable();
  
  private wishlistDetailsCache = new Map<number, WishlistDto>();
  
  private wishlistedProductsSubject = new BehaviorSubject<Set<number>>(new Set());
  public wishlistedProducts$ = this.wishlistedProductsSubject.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.initializeWishlistTracking();
  }
  private destroy$ = new Subject<void>();

  private initializeWishlistTracking(): void {
    // Auto-load wishlists عند تسجيل الدخول
    this.authService.currentUser$
      .pipe(
        filter((user: any) => !!user),
        delay(200),
        takeUntil(this.destroy$)
    )
      .subscribe(() => {
        this.loadUserWishlistsSummary();
      });
    
    // مسح البيانات عند تسجيل الخروج
    this.authService.currentUser$
      .pipe(
        filter((user: any) => !user),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.clearAllData();
      });
  }
 // ====================== CRUD العمليات الأساسية ======================

  // 1. جلب كل الـ wishlists للمستخدم الحالي
  loadUserWishlistsSummary(): void {
    console.log('Loading wishlists...'); 
    const token = localStorage.getItem('token');

    this.loadingSubject.next(true);
    
    this.http.get<ApiResponse<WishlistSummaryDto[]>>(`${this.apiUrl}/Wishlist`)
      .pipe(
        map(response => response.succeeded ? response.data : []),
        catchError(error => {
          console.error('Error loading user wishlists:', error);
          return of([]);
        })
      )
      .subscribe(wishlists => {
        this.userWishlistsSummarySubject.next(wishlists);
        this.loadingSubject.next(false);
        this.updateWishlistedProductsFromSummaries(wishlists);
      });
  }

  // 2. جلب تفاصيل wishlist واحدة
  getWishlistById(wishlistId: number, useCache = true): Observable<WishlistDto | null> {
    if (useCache && this.wishlistDetailsCache.has(wishlistId)) {
      return of(this.wishlistDetailsCache.get(wishlistId)!);
    }

    return this.http.get<ApiResponse<WishlistDto>>(`${this.apiUrl}/Wishlist/${wishlistId}`)
      .pipe(
        map(response => {
          if (response.succeeded) {
            this.wishlistDetailsCache.set(wishlistId, response.data);
            this.updateWishlistedProductsFromWishlist(response.data);
            return response.data;
          }
          return null;
        }),
        catchError(error => {
          console.error('Error loading wishlist details:', error);
          return of(null);
        })
      );
  }

  // 3. إنشاء wishlist جديدة
  createWishlist(request: CreateWishlistRequest): Observable<WishlistSummaryDto | null> {
    return this.http.post<ApiResponse<WishlistSummaryDto>>(`${this.apiUrl}/Wishlist`, request)
      .pipe(
        tap(response => {
          if (response.succeeded) {
            // إضافة الويشليست الجديدة للـ summary
            const currentSummaries = this.userWishlistsSummarySubject.value;
            this.userWishlistsSummarySubject.next([...currentSummaries, response.data]);
          }
        }),
        map(response => response.succeeded ? response.data : null),
        catchError(error => {
          console.error('Error creating wishlist:', error);
          return of(null);
        })
      );
  }

  // 4. تحديث wishlist
  updateWishlist(request: UpdateWishlistRequest): Observable<boolean> {
      const url = `${this.apiUrl}/Wishlist?id=${request.wishlistId}`;
      const  body = {
        name: request.name
      };
    return this.http.put<ApiResponse<any>>(url, body)
      .pipe(
        tap(response => {
          if (response.succeeded) {
            // تحديث الـ summary المحلي
            this.updateLocalWishlistSummary(request.wishlistId, request.name);
            // مسح الـ cache
            this.wishlistDetailsCache.delete(request.wishlistId);
          }
        }),
        map(response => response.succeeded),
        catchError(error => {
          console.error('Error updating wishlist:', error);
          return of(false);
        })
      );
  }

  // 5. حذف wishlist
  deleteWishlist(wishlistId: number): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/Wishlist?wishlistId=${wishlistId}`)
      .pipe(
        tap(response => {
          if (response.succeeded) {
            // إزالة من الـ summary المحلي
            const currentSummaries = this.userWishlistsSummarySubject.value;
            const updated = currentSummaries.filter(w => w.wishlistId !== wishlistId);
            this.userWishlistsSummarySubject.next(updated);
            
            // مسح الـ cache
            this.wishlistDetailsCache.delete(wishlistId);
          }
        }),
        map(response => response.succeeded),
        catchError(error => {
          console.error('Error deleting wishlist:', error);
          return of(false);
        })
      );
  }

  // ====================== عمليات المنتجات ======================

  // 6. جلب dropdown للمنتج
getWishlistsDropdown(productId: number): Observable<ApiResponse<WishlistDropdownOption[]>> {
  return this.http.get<ApiResponse<WishlistDropdownOption[]>>(
    `${this.apiUrl}/Wishlist/GetWishlistsDropDown?productId=${productId}`
  ).pipe(
    catchError(error => {
      console.error('Error loading wishlists dropdown:', error);
      // Return a proper ApiResponse structure
      return of({
        statusCode: 500,
        succeeded: false,
        message: 'Error loading wishlists',
        errors: [error.message || 'Unknown error'],
        data: []
      } as ApiResponse<WishlistDropdownOption[]>);
    })
  );
}

  // 7. إضافة منتج لويشليست
  addItemToWishlist(wishlistId: number, itemId: number): Observable<WishlistItemDto | null> {
    return this.http.post<ApiResponse<WishlistItemDto>>(
      `${this.apiUrl}/Wishlist/AddItemToWishlist?wishlistId=${wishlistId}&itemId=${itemId}`,
      {}
    ).pipe(
      tap(response => {
        if (response.succeeded) {
          this.addProductToLocalState(itemId);
          this.incrementWishlistItemCount(wishlistId);
          this.wishlistDetailsCache.delete(wishlistId);
        }
      }),
      map(response => response.succeeded ? response.data : null),
      catchError(error => {
        console.error('Error adding item to wishlist:', error);
        return of(null);
      })
    );
  }

  // 8. حذف منتج من ويشليست
  removeItemFromWishlist(wishlistId: number, itemId: number): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/Wishlist/RemoveItemFromWishlist?wishlistId=${wishlistId}&itemId=${itemId}`
    ).pipe(
      tap(response => {
        if (response.succeeded) {
          this.removeProductFromLocalState(itemId, wishlistId);
          this.decrementWishlistItemCount(wishlistId);
          this.wishlistDetailsCache.delete(wishlistId);
        }
      }),
      map(response => response.succeeded),
      catchError(error => {
        console.error('Error removing item from wishlist:', error);
        return of(false);
      })
    );
  }

  // ====================== استعلامات ======================

  // 9. التحقق من وجود المنتج في أي wishlist
  isProductWishlisted(productId: number): Observable<boolean> {
    return this.wishlistedProducts$.pipe(
      map(productIds => productIds.has(productId))
    );
  }

  // 10. فحص العنصر في ويشليست معينة
  isItemWishlisted(itemId: number): Observable<boolean> {
    return this.http.get<ApiResponse<boolean>>(
      `${this.apiUrl}/Wishlist/IsItemWishlisted?itemId=${itemId}`
    ).pipe(
      map(response => response.succeeded ? response.data : false),
      catchError(() => of(false))
    );
  }

  // 11. فحص المنتج في ويشليست معينة
  isProductInWishlist(productId: number): Observable<boolean> {
    return this.http.get<ApiResponse<boolean>>(
      `${this.apiUrl}/Wishlist/IsProductInWishlist?productId=${productId}`
    ).pipe(
      map(response => response.succeeded ? response.data : false),
      catchError(() => of(false))
    );
  }

  // ====================== Helper Methods ======================

  private updateWishlistedProductsFromSummaries(summaries: WishlistSummaryDto[]): void {
  // نجمع كل المنتجات من كل الـ wishlists
  const allProductIds = new Set<number>();
  
  summaries.forEach(summary => {
    if (this.wishlistDetailsCache.has(summary.wishlistId)) {
      const details = this.wishlistDetailsCache.get(summary.wishlistId)!;
      
      // Add null/undefined check for wishlistItemsDto
      if (details.wishlistItemsDto && details.wishlistItemsDto.length > 0) {
        details.wishlistItemsDto.forEach(item => {
          allProductIds.add(item.productId);
        });
      }
    }
  });
    this.wishlistedProductsSubject.next(allProductIds);
  }

  private updateWishlistedProductsFromWishlist(wishlist: WishlistDto): void {
    const currentProducts = this.wishlistedProductsSubject.value;
    const updatedProducts = new Set(currentProducts);
    
    wishlist.wishlistItemsDto?.forEach(item => {
      updatedProducts.add(item.productId);
    });
    
    this.wishlistedProductsSubject.next(updatedProducts);
  }

  private addProductToLocalState(productId: number): void {
    const current = this.wishlistedProductsSubject.value;
    const updated = new Set(current);
    updated.add(productId);
    this.wishlistedProductsSubject.next(updated);
  }

  private removeProductFromLocalState(productId: number, fromWishlistId: number): void {
    // نتحقق إن المنتج مش في wishlists تانية
    const isInOtherWishlists = Array.from(this.wishlistDetailsCache.values())
      .filter(w => w.wishlistId !== fromWishlistId)
      .some(w => w.wishlistItemsDto?.some(item => item.productId === productId));

    if (!isInOtherWishlists) {
      const current = this.wishlistedProductsSubject.value;
      const updated = new Set(current);
      updated.delete(productId);
      this.wishlistedProductsSubject.next(updated);
    }
  }

  private incrementWishlistItemCount(wishlistId: number): void {
    const current = this.userWishlistsSummarySubject.value;
    const updated = current.map(w =>
      w.wishlistId === wishlistId
        ? { ...w, itemsCount: w.itemsCount + 1 }
        : w
    );
    this.userWishlistsSummarySubject.next(updated);
  }

  private decrementWishlistItemCount(wishlistId: number): void {
    const current = this.userWishlistsSummarySubject.value;
    const updated = current.map(w =>
      w.wishlistId === wishlistId
        ? { ...w, itemsCount: Math.max(0, w.itemsCount - 1) }
        : w
    );
    this.userWishlistsSummarySubject.next(updated);
  }

  private updateLocalWishlistSummary(wishlistId: number, newName: string): void {
    const current = this.userWishlistsSummarySubject.value;
    const updated = current.map(w =>
      w.wishlistId === wishlistId
        ? { ...w, wishlistName: newName }
        : w
    );
    this.userWishlistsSummarySubject.next(updated);
  }

  private clearAllData(): void {
    this.userWishlistsSummarySubject.next([]);
    this.wishlistDetailsCache.clear();
    this.wishlistedProductsSubject.next(new Set());
  }

  // ====================== Getters ======================
  
  getWishlistsCount(): Observable<number> {
    return this.userWishlistsSummary$.pipe(
      map(wishlists => wishlists.length)
    );
  }

  getTotalItemsCount(): Observable<number> {
    return this.userWishlistsSummary$.pipe(
      map(wishlists => wishlists.reduce((total, w) => total + w.itemsCount, 0))
    );
  }
}