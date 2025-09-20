// account.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';

// Response interface to match your C# wrapper
export interface ApiResponse<T> {
  statusCode: number;
  succeeded: boolean;
  message: string | null;
  errors: string[] | null;
  data: T | null;
}

// DTO interfaces
export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface CreateAddressDto {
  location: string;
  area: string;
  fullAddress: string;
  floorNumber: number;
  phoneNumber: string;
}

export interface UpdateAddressDto {
  addressId: number;
  location: string;
  area: string;
  fullAddress: string;
  floorNumber: number;
  phoneNumber: string;
}

// Profile and Address data interfaces (adjust based on your actual response data)
export interface ProfileData {
  // Add your profile properties here based on what GetProfile returns
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface Address {
  addressId: number;
  // applicationUserId: string;
  location: string;
  area: string;
  fullAddress: string;
  floorNumber: number;
  phoneNumber: string;
  isDefault?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  
  // Reactive state with signals
  private profileData = signal<ProfileData | null>(null);
  private addresses = signal<Address[]>([]);
  private selectedAddressId = signal<number | null>(null);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Public readonly signals for components to consume
  readonly profile = this.profileData.asReadonly();
  readonly userAddresses = this.addresses.asReadonly();
  readonly selectedAddress = this.selectedAddressId.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly errorMessage = this.error.asReadonly();

  private readonly baseUrl = environment.apiUrl + '/user';

  // Profile methods
  updateProfile(updateProfileDto: UpdateProfileDto): Observable<ApiResponse<any>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}/update-profile`, 
      updateProfileDto
    ).pipe(
      map(response => {
        this.loading.set(false);
        if (response.succeeded) {
          this.toastService.profileUpdateSuccess();
          // Optionally refresh profile data after update
          this.getProfile().subscribe();
        } else {
          this.toastService.showError('Failed to update profile', 'Profile Error');
        }
        return response;
      }),
      catchError(error => this.handleError(error))
    );
  }

  getProfile(): Observable<ApiResponse<ProfileData>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<ApiResponse<ProfileData>>(
      `${this.baseUrl}/get-profile`
    ).pipe(
      map(response => {
        this.loading.set(false);
        if (response.succeeded && response.data) {
          this.profileData.set(response.data);
        } else {
          this.toastService.showError('Failed to load profile', 'Profile Error');
        }
        return response;
      }),
      catchError(error => this.handleError(error))
    );
  }

  // Address methods
  addAddress(createAddressDto: CreateAddressDto): Observable<ApiResponse<Address>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<ApiResponse<Address>>(
      `${this.baseUrl}/add-address`, 
      createAddressDto
    ).pipe(
      map(response => {
        this.loading.set(false);
        if (response.succeeded && response.data) {
          this.toastService.addressAddedSuccess();
          // Refresh addresses after successful addition
          this.getAddresses().subscribe();
        } else {
          this.toastService.showError('Failed to add address', 'Address Error');
        }
        return response;
      }),
      catchError(error => this.handleError(error))
    );
  }

  updateAddress(updateAddressDto: UpdateAddressDto): Observable<ApiResponse<Address>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<ApiResponse<Address>>(
      `${this.baseUrl}/update-address`, 
      updateAddressDto
    ).pipe(
      map(response => {
        this.loading.set(false);
        if (response.succeeded) {
          this.toastService.addressUpdatedSuccess();
          // Refresh addresses after successful update
          this.getAddresses().subscribe();
        } else {
          this.toastService.showError('Failed to update address', 'Address Error');
        }
        return response;
      }),
      catchError(error => this.handleError(error))
    );
  }

  deleteAddress(addressId: number): Observable<ApiResponse<any>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/${addressId}`
    ).pipe(
      map(response => {
        this.loading.set(false);
        if (response.succeeded) {
          this.toastService.addressDeletedSuccess();
          // Refresh addresses after successful deletion
          this.getAddresses().subscribe();
        } else {
          this.toastService.showError('Failed to delete address', 'Address Error');
        }
        return response;
      }),
      catchError(error => this.handleError(error))
    );
  }

  getAddresses(): Observable<ApiResponse<Address[]>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<ApiResponse<Address[]>>(
      `${this.baseUrl}/address`
    ).pipe(
      map(response => {
        this.loading.set(false);
        if (response.succeeded && response.data) {
          this.addresses.set(response.data);
          // Initialize selected address if not set: prefer default, else first
          if (this.selectedAddressId() == null) {
            const def = response.data.find(a => a.isDefault);
            this.selectedAddressId.set((def ?? response.data[0])?.addressId ?? null);
          }
        } else {
          this.toastService.showError('Failed to load addresses', 'Address Error');
        }
        return response;
      }),
      catchError(error => this.handleError(error))
    );
  }

  // Selection helpers
  setSelectedAddress(addressId: number): void {
    this.selectedAddressId.set(addressId);
  }

  getSelectedAddressId(): number | null {
    return this.selectedAddressId();
  }

  // Utility methods
  clearError(): void {
    this.error.set(null);
  }

  refreshAllData(): void {
    this.getProfile().subscribe();
    this.getAddresses().subscribe();
  }

  private handleError(error: any): Observable<never> {
    this.loading.set(false);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    this.error.set(errorMessage);
    this.toastService.showError(errorMessage, 'Error');
    return throwError(() => new Error(errorMessage));
  }
}