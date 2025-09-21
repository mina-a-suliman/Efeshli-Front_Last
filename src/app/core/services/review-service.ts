
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface AddReviewDto {
  rate: number;
  reviewText: string;
  productId: number;
  images?: File[];
}

export interface ReviewResponseDto {
  id: number;
  rate: number;
  reviewText: string;
  productId: number;
  images?: any[]; // Changed from Image[] to any[] since your response shows null
}

export interface ApiResponse<T> {
  statusCode: string;
  succeeded: boolean;
  message: string;
  errors: any;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private baseUrlUrl = 'https://efreshli.runasp.net/api/Review';

  constructor(private http: HttpClient) { }

  addReview(review: AddReviewDto): Observable<ApiResponse<ReviewResponseDto>> {
    const formData = new FormData();
    formData.append('rate', review.rate.toString());
    formData.append('reviewText', review.reviewText);
    formData.append('productId', review.productId.toString());
    
    if (review.images) {
      review.images.forEach((image, index) => {
        formData.append(`images`, image, image.name);
      });
    }

    return this.http.post<ApiResponse<ReviewResponseDto>>(`${this.baseUrlUrl}/reviews`, formData)
      .pipe(catchError(this.handleError));
  }

  getReviewsSummary(productId: number): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.baseUrlUrl}/prouduct/${productId}/reviews/summry`)
      .pipe(catchError(this.handleError));
  }

  getAllProductReviews(productId: number): Observable<ApiResponse<ReviewResponseDto[]>> {
    return this.http.get<ApiResponse<ReviewResponseDto[]>>(`${this.baseUrlUrl}/reviews/${productId}`)
      .pipe(catchError(this.handleError));
  }

  getReviewById(id: number): Observable<ApiResponse<ReviewResponseDto>> {
    return this.http.get<ApiResponse<ReviewResponseDto>>(`${this.baseUrlUrl}/${id}/reviews`)
      .pipe(catchError(this.handleError));
  }

  deleteReviewById(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrlUrl}/${1}/reviews`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => new Error('An error occurred. Please try again.'));
  }
}