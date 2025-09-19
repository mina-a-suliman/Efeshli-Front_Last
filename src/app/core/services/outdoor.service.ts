// src/app/core/services/outdoor.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OutdoorApiResponse } from '../models/outdoor.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OutdoorService {
  private apiUrl = `${environment.apiUrl}/Collections/outdoor`;

  constructor(private http: HttpClient) { }

  getOutdoorProducts(pageNumber: number = 1, pageSize: number = 24): Observable<OutdoorApiResponse> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<OutdoorApiResponse>(this.apiUrl, { params });
  }
}