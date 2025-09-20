import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';

export interface ApiResponse<T> {
  statusCode: number;
  succeeded: boolean;
  message: string | null;
  errors: string[] | null;
  data: T | null;
}


export interface CartItemDto {
  cartItemId: number;
  productItemId: number;
  productName: string;
  price: number;
  quantity: number;
  discount:number;
  totalPrice: number;
  dimensionsOrSize: string;

  sku: string;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  imageUrls: string[];

  fabricColorId: number;
  fabricColorName: string;
  fabricColorImageUrl: string;

  woodColorId: number;
  woodColorName: string;
  woodColorImageUrl: string;
}


export interface CartDto {
  cartId: number;
  applicationUserId: string;
  items: CartItemDto[];
  grandTotal: number;
}

export interface AddToCartRequestDto {
  productItemId: number;
  quantity: number;
}

export interface UpdateCartItemQuantityRequestDto {
  cartItemId: number;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private baseUrl = `${environment.apiUrl}/Cart`;
  private cartCountSubject = new BehaviorSubject<number>(0);
  readonly cartCount$ = this.cartCountSubject.asObservable();

  getCart(): Observable<ApiResponse<CartDto>> {
    return this.http.get<ApiResponse<CartDto>>(this.baseUrl);
  }

  addToCart(request: AddToCartRequestDto): Observable<ApiResponse<CartDto>> {
    return this.http.post<ApiResponse<CartDto>>(`${this.baseUrl}/add`, request).pipe(
      tap((response) => {
        if (response.succeeded) {
          this.toastService.productAddedToCart();
        } else {
          this.toastService.showError('Failed to add product to cart', 'Cart Error');
        }
        this.refreshCartCount();
      }),
      catchError((error) => {
        this.toastService.showError('Failed to add product to cart', 'Cart Error');
        return throwError(() => error);
      })
    );
    }

  updateQuantity(request: UpdateCartItemQuantityRequestDto): Observable<ApiResponse<CartDto>> {
    return this.http.put<ApiResponse<CartDto>>(`${this.baseUrl}/update-quantity`, request).pipe(
      tap((response) => {
        if (response.succeeded) {
          this.toastService.showSuccess('Quantity updated', 'Cart Updated');
        } else {
          this.toastService.showError('Failed to update quantity', 'Cart Error');
        }
        this.refreshCartCount();
      }),
      catchError((error) => {
        this.toastService.showError('Failed to update quantity', 'Cart Error');
        return throwError(() => error);
      })
    );
  }

  removeItem(cartItemId: number): Observable<ApiResponse<CartDto>> {
    return this.http.delete<ApiResponse<CartDto>>(`${this.baseUrl}/remove/${cartItemId}`).pipe(
      tap((response) => {
        if (response.succeeded) {
          this.toastService.productRemovedFromCart();
        } else {
          this.toastService.showError('Failed to remove item from cart', 'Cart Error');
        }
        this.refreshCartCount();
      }),
      catchError((error) => {
        this.toastService.showError('Failed to remove item from cart', 'Cart Error');
        return throwError(() => error);
      })
    );
  }

  clearCart(): Observable<ApiResponse<CartDto>> {
    return this.http.delete<ApiResponse<CartDto>>(`${this.baseUrl}/clear`).pipe(
      tap((response) => {
        if (response.succeeded) {
          this.toastService.showSuccess('Cart cleared successfully', 'Cart Cleared');
        } else {
          this.toastService.showError('Failed to clear cart', 'Cart Error');
        }
        this.refreshCartCount();
      }),
      catchError((error) => {
        this.toastService.showError('Failed to clear cart', 'Cart Error');
        return throwError(() => error);
      })
    );
  }

  getCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/count`);
  }

  refreshCartCount(): void {
    if (!localStorage.getItem('token')) {
      this.cartCountSubject.next(0);
      return;
    }
    
    this.getCount().subscribe({
      next: (resp) => {
        if (resp.succeeded && typeof resp.data === 'number') {
          this.cartCountSubject.next(resp.data);
        }
      },
      error: (err) => {
        // Silently handle error - cart count will remain 0
      }
    });
  }
}


