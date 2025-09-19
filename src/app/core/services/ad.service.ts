// src/app/core/services/ad.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdApiResponse } from '../models/ad.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdService {
  private apiUrl = `${environment.apiUrl}/Filter/filter`;

  constructor(private http: HttpClient) { }

  getAdData(brandId: number = 119, pageNumber: number = 1, pageSize: number = 1): Observable<AdApiResponse> {
    let params = new HttpParams()
      .set('brandIds', brandId.toString())
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<AdApiResponse>(this.apiUrl, { params });
  }
}