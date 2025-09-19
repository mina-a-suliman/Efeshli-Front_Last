// src/app/core/services/category.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Category {
  categoryId: number;
  name: string;
  imageUrl: string | null;
  hasSubCategories: boolean;
  parentId?: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  succeeded: boolean;
  message: string;
  errors: any;
  data: T;
}

@Injectable({
  providedIn: 'root' // هذا يجعله متاحًا على مستوى التطبيق
})
export class CategoryService {
  private baseUrl = 'https://efreshliapi.runasp.net/api/Category';

  constructor(private http: HttpClient) { }

  getMainCategories(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(`${this.baseUrl}/Categories`).pipe(
      map(response => response.data)
    );
  }

  getSubCategories(categoryId: number): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(`${this.baseUrl}/Categories/${categoryId}`).pipe(
      map(response => response.data)
    );
  }

  getCategoryDetails(categoryId: number): Observable<Category> {
    return this.http.get<ApiResponse<Category>>(`${this.baseUrl}/${categoryId}`).pipe(
      map(response => response.data)
    );
  }
}