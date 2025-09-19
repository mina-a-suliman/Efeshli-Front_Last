// src/app/core/services/product.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, Iproduct } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get product by ID from API
   */
  getById(id: number): Observable<Iproduct> {
    const url = `${this.apiUrl}/Product/GetProductById/${id}`;
    
    return this.http.get<ApiResponse<Iproduct>>(url).pipe(
      map(response => {
        if (response.succeeded && response.data) {
          // Transform API response to match UI expectations
          return this.transformProductData(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch product');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get product by slug (if you want to support slug-based routing later)
   */
  getBySlug(slug: string): Observable<Iproduct> {
    // This would be implemented when you have a slug-based API endpoint
    const url = `${this.apiUrl}/Product/GetProductBySlug/${slug}`;
    
    return this.http.get<ApiResponse<Iproduct>>(url).pipe(
      map(response => {
        if (response.succeeded && response.data) {
          return this.transformProductData(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch product');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Transform API data to match UI expectations
   */
  private transformProductData(product: Iproduct): Iproduct {
    return {
      ...product,
      // Map productImages to images for UI compatibility
      images: product.productImages,
      // Use mainFinalPrice as the display price
      price: product.mainFinalPrice,
      // Add default values for missing properties
      vatIncluded: true,
      madeToOrder: false,
      deliveryMinDays: 7,
      deliveryMaxDays: 14,
      additionalInfo: 'This product is made with high-quality materials and craftsmanship.',
      shippingReturn: 'Free shipping on orders over 1000 EGP. 30-day return policy.',
      // Transform productSpecification array to object for UI
      specs: this.transformSpecifications(product.productSpecification)
    };
  }

  /**
   * Transform specifications array to key-value object
   */
  private transformSpecifications(specs: any[]): {[key: string]: string} {
    const specsObj: {[key: string]: string} = {};
    
    if (specs && specs.length > 0) {
      specs.forEach(spec => {
        if (spec.name && spec.value) {
          specsObj[spec.name] = spec.value;
        }
      });
    } else {
      // Default specifications if none provided
      specsObj['Dimensions'] = 'W 70 x D 70 x H 72 cm';
      specsObj['Material'] = 'High-quality wood and fabric';
      specsObj['Weight'] = '25 kg';
      specsObj['Assembly Required'] = 'Yes';
    }
    
    return specsObj;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred while fetching product data';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      
      // Handle specific HTTP status codes
      switch (error.status) {
        case 404:
          errorMessage = 'Product not found';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later';
          break;
        case 0:
          errorMessage = 'Unable to connect to server. Please check your internet connection';
          break;
      }
    }
    
    console.error('ProductService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}