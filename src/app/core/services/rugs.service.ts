// src/app/core/services/rugs.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RugsApiResponse } from '../models/rugs.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RugsService {
  private apiUrl = `${environment.apiUrl}/Collections/rugs`;

  constructor(private http: HttpClient) { }

  getRugsProducts(pageNumber: number = 1, pageSize: number = 24): Observable<RugsApiResponse> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<RugsApiResponse>(this.apiUrl, { params });
  }
}