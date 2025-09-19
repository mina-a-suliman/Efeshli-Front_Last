// src/app/core/services/brand.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Brand } from '../models/brand.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private baseUrl = `${environment.apiUrl}/Brand`;

  constructor(private http: HttpClient) {}

  getAllBrands(): Observable<ApiResponse<Brand[]>> {
    return this.http.get<ApiResponse<Brand[]>>(`${this.baseUrl}/Brands`);
  }
}
