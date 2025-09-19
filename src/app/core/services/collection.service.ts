// src/app/core/services/collection.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CollectionResponse, ApiResponse } from '../models/collection.model';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private baseUrl = 'https://efreshliapi.runasp.net/api';

  constructor(private http: HttpClient) { }

  getCollections(pageNumber: number = 1, pageSize: number = 24): Observable<CollectionResponse> {
    return this.http.get<ApiResponse<CollectionResponse>>(
      `${this.baseUrl}/Collections/%20?pageNumber=${pageNumber}&pageSize=${pageSize}`
    ).pipe(
      map(response => response.data)
    );
  }
}