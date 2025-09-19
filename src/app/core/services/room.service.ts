// src/app/core/services/room.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoomApiResponse } from '../models/room.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = `${environment.apiUrl}/Collections`;

  constructor(private http: HttpClient) { }

  getRoomProducts(roomType: string, pageNumber: number = 1, pageSize: number = 24): Observable<RoomApiResponse> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<RoomApiResponse>(`${this.apiUrl}/${roomType}`, { params });
  }
}