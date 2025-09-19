import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { ApiResponse } from '../models/api-response.models';
import { OrderCheckoutPreview, OrderDetails, OrderStatus, OrderSummary } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private baseUrl = `${environment.apiUrl}/order`;

  constructor(private http: HttpClient) {}

  // Get checkout preview with calculated totals
  getCheckoutPreview(couponCode?: string): Observable<ApiResponse<OrderCheckoutPreview>> {
    let params = new HttpParams();
    if (couponCode) {
      params = params.set('couponCode', couponCode);
    }
    
    return this.http.get<ApiResponse<OrderCheckoutPreview>>(
      `${this.baseUrl}/checkout-preview`, 
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get all orders for current user with optional status filter
  getMyOrders(status?: OrderStatus): Observable<ApiResponse<OrderSummary[]>> {
    let params = new HttpParams();
    if (status !== undefined) {
      params = params.set('status', status.toString());
    }
    
    return this.http.get<ApiResponse<OrderSummary[]>>(
      `${this.baseUrl}/my-orders`, 
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get all orders (admin functionality)
  getAllOrders(): Observable<ApiResponse<OrderSummary[]>> {
    return this.http.get<ApiResponse<OrderSummary[]>>(
      `${this.baseUrl}/all`
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get specific order details by ID
  getOrderById(orderId: number): Observable<ApiResponse<OrderDetails>> {
    return this.http.get<ApiResponse<OrderDetails>>(
      `${this.baseUrl}/${orderId}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Cancel a pending order
  cancelOrder(orderId: number): Observable<ApiResponse<boolean>> {
    return this.http.patch<ApiResponse<boolean>>(
      `${this.baseUrl}/${orderId}/cancel`,
      {}
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Handle HTTP errors and transform to consistent response format
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    let statusCode = error.status || 500;
    
    // Try to extract error message from backend response
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.message) {
      // HTTP error
      errorMessage = error.message;
    }

    // Return consistent error response format
    const errorResponse: ApiResponse<never> = {
      statusCode,
      succeeded: false,
      message: errorMessage,
      errors: error.error?.errors || [errorMessage],
      data: null as never
    };

    return throwError(() => errorResponse);
  }
}