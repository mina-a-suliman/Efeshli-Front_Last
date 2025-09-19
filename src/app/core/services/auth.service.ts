// // src/app/core/services/auth.service.ts

// import { Injectable, Inject, PLATFORM_ID, NgZone } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, lastValueFrom, tap } from 'rxjs';
// import { environment } from '../../../environments/environment';
// // import { StorageService } from './storage.service';
// // import { Router } from '@angular/router';


// // Define types
// export interface ExternalLoginRequest {
//   provider: 'Google' | 'Facebook';
//   token: string;
// }

// export interface User {
//   id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   roles: string[];
// }

// export interface ApiResponse<T = any> {
//   statusCode: number;
//   succeeded: boolean;
//   message: string;
//   errors: string[] | null;
//   data: T;
// }

// export interface LoginRequest {
//   email: string;
//   password: string;
// }

// export interface RegisterRequest {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   password: string;
//   confirmPassword: string;
// }

// export interface ForgotPasswordRequest {
//   email: string;
// }

// export interface ResetPasswordRequest {
//   email: string;
//   token: string;
//   newPassword: string;
//   confirmPassword: string;
// }

// declare const google: any;
// declare const window: any;

// @Injectable({ providedIn: 'root' })



// export class AuthService {
//   private readonly apiUrl = `${environment.apiUrl}/auth`;
//   private currentUserSubject = new BehaviorSubject<User | null>(null);
//   public currentUser$ = this.currentUserSubject.asObservable();
//   private tokenExpirationTimer: any = null;


// constructor(
//   private http: HttpClient,
//   @Inject(PLATFORM_ID) private platformId: any,
//   private ngZone: NgZone,
// ) {
//   this.initializeAuthState();
// }
//   private initializeAuthState(): void {
//     if (isPlatformBrowser(this.platformId)) {
//       // const token = this.storageService.getItem('token');
//       const token = localStorage.getItem('token');
//       if (token && this.validateToken(token)) {
//         const user = this.decodeToken(token);
//         this.currentUserSubject.next(user);
//         this.setAutoLogout(token);
//       }
//     }
//   }

//   // -----------------------------
//   // Google Sign-In
//   // -----------------------------

//   /**
//    * Initialize Google SDK on page load
//    */
//   initGoogle(): void {
//     if (!isPlatformBrowser(this.platformId)) return;

//     this.ngZone.runOutsideAngular(() => {
//       this.loadGoogleScript()
//         .then(() => this.initializeGoogleAuth())
//         .catch(console.error);
//     });
//   }

//   /**
//    * Trigger Google Sign-In popup
//    */
//   loginWithGoogle(): void {
//     if (!isPlatformBrowser(this.platformId)) return;

//     this.ngZone.runOutsideAngular(() => {
//       this.loadGoogleScript()
//         .then(() => this.initializeGoogleAuth())
//         .then(() => {
//           google.accounts.id.prompt();
//         })
//         .catch((err: any) => {
//           console.error('Failed to initialize Google Sign-In', err);
//           this.ngZone.run(() => {
//             alert('Failed to load Google Sign-In. Please try again.');
//           });
//         });
//     });
//   }

//   private loadGoogleScript(): Promise<void> {
//     return new Promise((resolve, reject) => {
//       if ((window as any).google) return resolve();

//       const script = document.createElement('script');
//       script.src = 'https://accounts.google.com/gsi/client'; // ✅ Fixed: removed extra spaces
//       script.async = true;
//       script.defer = true;
//       script.onload = () => resolve();
//       script.onerror = () => reject('Failed to load Google Identity Services script');
//       document.head.appendChild(script);
//     });
//   }

//   private initializeGoogleAuth(): void {
//     try {
//       google.accounts.id.initialize({
//         client_id: environment.googleClientId,
//         callback: this.handleGoogleResponse.bind(this), // ✅ Will call unified handler
//         auto_select: false,
//         cancel_on_tap_outside: true
//       });
//     } catch (error) {
//       console.error('Google Identity Services initialization failed', error);
//     }
//   }

//   private async handleGoogleResponse(response: any): Promise<void> {
//     const idToken = response.credential;
//     await this.handleExternalLogin('Google', idToken);
//   }

//   // -----------------------------
//   // Facebook Sign-In
//   // -----------------------------

//   loginWithFacebook(): void {
//     if (!isPlatformBrowser(this.platformId)) return;

//     this.ngZone.runOutsideAngular(() => {
//       this.loadFacebookSDK()
//         .then(() => {
//           (window as any).FB.login(
//             (response: any) => {
//               this.ngZone.run(() => this.handleFacebookResponse(response));
//             },
//             { scope: 'public_profile,email' }
//           );
//         })
//         .catch((err: any) => {
//           console.error('Failed to load Facebook SDK', err);
//           this.ngZone.run(() => {
//           });
//         });
//     });
//   }

//   private loadFacebookSDK(): Promise<void> {
//     return new Promise((resolve, reject) => {
//       if ((window as any).FB) return resolve();

//       (window as any).fbAsyncInit = () => {
//         (window as any).FB.init({
//           appId: environment.facebookAppId,
//           autoLogAppEvents: true,
//           xfbml: true,
//           version: 'v20.0'
//         });
//         resolve();
//       };

//       const script = document.createElement('script');
//       script.src = 'https://connect.facebook.net/en_US/sdk.js';
//       script.async = true;
//       script.defer = true;
//       script.onerror = () => reject('Facebook SDK failed to load');
//       document.head.appendChild(script);
//     });
//   }

//   private async handleFacebookResponse(response: any): Promise<void> {
//     if (response.authResponse) {
//       const accessToken = response.authResponse.accessToken;
//       await this.handleExternalLogin('Facebook', accessToken);
//     } else {
//       this.ngZone.run(() => {
//         alert('Failed to sign in with Facebook.');
//       });
//     }
//   }

//   // -----------------------------
//   // Unified External Login Handler
//   // -----------------------------

//   private async handleExternalLogin(provider: 'Google' | 'Facebook', token: string): Promise<void> {
//     try {
//       const apiResponse = await lastValueFrom(
//         this.http.post<ApiResponse<string>>(`${this.apiUrl}/external-login`, {
//           provider,
//           token
//         } as ExternalLoginRequest)
//       );

//       this.ngZone.run(() => {
//         if (apiResponse.succeeded && apiResponse.data) {
//           this.setAuthState(apiResponse.data);
//           // this.redirectAfterLogin();
//         } else {
//           const errorMsg = apiResponse.errors?.join(', ') || apiResponse.message || 'Login failed';
//           alert(`${provider} login failed: ${errorMsg}`);
//           this.clearAuthState();
//         }
//       });
//     } catch (error: any) {
//       console.error(`${provider} login error`, error);
//       this.ngZone.run(() => {
//         this.clearAuthState();
//         if (error.status === 500) {
//           alert('Server error. Please try again later.');
//         } else {
//           alert(`Failed to sign in with ${provider}. Please try again.`);
//         }
//       });
//     }
//   }

//   // -----------------------------
//   // Standard Auth Methods
//   // -----------------------------

//   login(credentials: LoginRequest): ReturnType<typeof this.http.post<ApiResponse<string>>> {
//     return this.http.post<ApiResponse<string>>(`${this.apiUrl}/login`, credentials).pipe(
//       tap({
//         next: (response) => {
//           if (response.succeeded && response.data) {
//             this.setAuthState(response.data);
//           }
//         },
//         error: () => this.clearAuthState()
//       })
//     );
//   }

//   register(userData: RegisterRequest): ReturnType<typeof this.http.post<ApiResponse<string>>> {
//     return this.http.post<ApiResponse<string>>(`${this.apiUrl}/register`, userData);
//   }

//   forgotPassword(request: ForgotPasswordRequest): ReturnType<typeof this.http.post<ApiResponse<boolean>>> {
//     return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/forgot-password`, request);
//   }

//   resetPassword(request: ResetPasswordRequest): ReturnType<typeof this.http.post<ApiResponse<boolean>>> {
//     return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/reset-password`, request);
//   }

//   logout(): void {
//     this.clearAuthState();
//   }

//   private setAuthState(token: string): void {
//     if (!this.validateToken(token)) {
//       this.clearAuthState();
//       return;
//     }
//     localStorage.setItem('token', token);
//     const user = this.decodeToken(token);
//     this.currentUserSubject.next(user);
//     this.setAutoLogout(token);
//   }

//   private clearAuthState(): void {
//     localStorage.removeItem('token');
//     this.currentUserSubject.next(null);
//     if (this.tokenExpirationTimer) {
//       clearTimeout(this.tokenExpirationTimer);
//       this.tokenExpirationTimer = null;
//     }
//   }

//   private validateToken(token: string | null): boolean {
//     if (!token) return false;
//     try {
//       const payload = this.getTokenPayload(token);
//       return payload.exp * 1000 > Date.now();
//     } catch {
//       return false;
//     }
//   }

//   private getTokenPayload(token: string): any {
//     try {
//       return JSON.parse(atob(token.split('.')[1]));
//     } catch (e) {
//       throw new Error('Invalid token format');
//     }
//   }

//   private decodeToken(token: string): User {
//     try {
//       const payload = this.getTokenPayload(token);

//       const nameIdentifier = payload.sub ||
//         payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

//       const emailClaim = payload.email ||
//         payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];

//       let roles: string[] = [];
//       if (payload.role) {
//         roles = Array.isArray(payload.role) ? payload.role : [payload.role];
//       } else if (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) {
//         const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
//         roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
//       }

//       const fullNameParts = (payload.name || payload.fullName || '').split(' ');

//       return {
//         id: nameIdentifier || '',
//         email: emailClaim || '',
//         firstName: payload.given_name || payload.firstName || fullNameParts[0] || '',
//         lastName: payload.family_name || payload.lastName || fullNameParts.slice(1).join(' ') || '',
//         roles: roles.filter(role => !!role)
//       };
//     } catch (e) {
//       console.error('Failed to decode token:', e);
//       return this.getNullUser();
//     }
//   }

//   private getNullUser(): User {
//     return { id: '', email: '', firstName: '', lastName: '', roles: [] };
//   }

//   private setAutoLogout(token: string): void {
//     if (this.tokenExpirationTimer) {
//       clearTimeout(this.tokenExpirationTimer);
//     }

//     try {
//       const payload = this.getTokenPayload(token);
//       const expiresIn = (payload.exp * 1000) - Date.now();
//       const logoutTime = Math.max(0, expiresIn - 60000);

//       if (logoutTime > 0) {
//         this.tokenExpirationTimer = setTimeout(() => this.logout(), logoutTime);
//       }
//     } catch (e) {
//       console.error('Failed to set auto-logout timer:', e);
//     }
//   }

//   isAuthenticated(): boolean {
//    const token = localStorage.getItem('token');
//     if (!token) return false;
//     return true;
    
//   }

//   hasAnyRole(roles: string[]): boolean {
//     const user = this.getCurrentUser();
//     return user ? roles.some(role => user.roles.includes(role)) : false;
//   }

//   getCurrentUser(): User | null {
//     //debugger
//     //this.setAuthState(localStorage.getItem('token')!);
//     return this.currentUserSubject.value;
    
//   }
  
// }











// src/app/core/services/auth.service.ts

import { Injectable, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, lastValueFrom, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { CartService } from './cart.service';
import { ToastService } from './toast.service';
// import { StorageService } from './storage.service';
// import { Router } from '@angular/router';


// Define types
export interface ExternalLoginRequest {
  provider: 'Google' | 'Facebook';
  token: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface ApiResponse<T = any> {
  statusCode: number;
  succeeded: boolean;
  message: string;
  errors: string[] | null;
  data: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

declare const google: any;
declare const window: any;

@Injectable({ providedIn: 'root' })



export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenExpirationTimer: any = null;


constructor(
  private router: Router,
  private http: HttpClient,
  private cartService: CartService,
  private toastService: ToastService,
  @Inject(PLATFORM_ID) private platformId: any,
  private ngZone: NgZone,
) {
  this.initializeAuthState();
}
  private initializeAuthState(): void {
    if (isPlatformBrowser(this.platformId)) {
      // const token = this.storageService.getItem('token');
      const token = localStorage.getItem('token');
      if (token && this.validateToken(token)) {
        const user = this.decodeToken(token);
        this.currentUserSubject.next(user);
        this.setAutoLogout(token);
      }
    }
  }

  // -----------------------------
  // Google Sign-In
  // -----------------------------

  /**
   * Initialize Google SDK on page load
   */
  initGoogle(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ngZone.runOutsideAngular(() => {
      this.loadGoogleScript()
        .then(() => this.initializeGoogleAuth())
        .catch(console.error);
    });
  }

  /**
   * Trigger Google Sign-In popup
   */
  loginWithGoogle(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ngZone.runOutsideAngular(() => {
      this.loadGoogleScript()
        .then(() => this.initializeGoogleAuth())
        .then(() => {
          google.accounts.id.prompt();
        })
        .catch((err: any) => {
          console.error('Failed to initialize Google Sign-In', err);
          this.ngZone.run(() => {
            this.toastService.showError('Failed to load Google Sign-In. Please try again.', 'Google Sign-In Error');
          });
        });
    });
  }

  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).google) return resolve();

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client'; // ✅ Fixed: removed extra spaces
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject('Failed to load Google Identity Services script');
      document.head.appendChild(script);
    });
  }

  private initializeGoogleAuth(): void {
    try {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: this.handleGoogleResponse.bind(this), // ✅ Will call unified handler
        auto_select: false,
        cancel_on_tap_outside: true
      });
    } catch (error) {
      console.error('Google Identity Services initialization failed', error);
    }
  }

  private async handleGoogleResponse(response: any): Promise<void> {
    const idToken = response.credential;
    await this.handleExternalLogin('Google', idToken);
  }

  // -----------------------------
  // Facebook Sign-In
  // -----------------------------

  loginWithFacebook(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ngZone.runOutsideAngular(() => {
      this.loadFacebookSDK()
        .then(() => {
          (window as any).FB.login(
            (response: any) => {
              this.ngZone.run(() => this.handleFacebookResponse(response));
            },
            { scope: 'public_profile,email' }
          );
        })
        .catch((err: any) => {
          console.error('Failed to load Facebook SDK', err);
          this.ngZone.run(() => {
            this.toastService.showError('Failed to load Facebook SDK. Please try again.', 'Facebook Sign-In Error');
          });
        });
    });
  }

  private loadFacebookSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).FB) return resolve();

      (window as any).fbAsyncInit = () => {
        (window as any).FB.init({
          appId: environment.facebookAppId,
          autoLogAppEvents: true,
          xfbml: true,
          version: 'v20.0'
        });
        resolve();
      };

      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.onerror = () => reject('Facebook SDK failed to load');
      document.head.appendChild(script);
    });
  }

  private async handleFacebookResponse(response: any): Promise<void> {
    if (response.authResponse) {
      const accessToken = response.authResponse.accessToken;
      await this.handleExternalLogin('Facebook', accessToken);
    } else {
      this.ngZone.run(() => {
        this.toastService.showError('Failed to sign in with Facebook.', 'Facebook Sign-In Error');
      });
    }
  }

  // -----------------------------
  // Unified External Login Handler
  // -----------------------------

  private async handleExternalLogin(provider: 'Google' | 'Facebook', token: string): Promise<void> {
    try {
      const apiResponse = await lastValueFrom(
        this.http.post<ApiResponse<string>>(`${this.apiUrl}/external-login`, {
          provider,
          token
        } as ExternalLoginRequest)
      );

      this.ngZone.run(() => {
        if (apiResponse.succeeded && apiResponse.data) {
          this.setAuthState(apiResponse.data);
          this.toastService.loginSuccess();
          this.redirectAfterLogin();
        } else {
          const errorMsg = apiResponse.errors?.join(', ') || apiResponse.message || 'Login failed';
          this.toastService.showError(`${provider} login failed: ${errorMsg}`, 'Login Error');
          this.clearAuthState();
        }
      });
    } catch (error: any) {
      console.error(`${provider} login error`, error);
      this.ngZone.run(() => {
        this.clearAuthState();
        if (error.status === 500) {
          this.toastService.serverError();
        } else {
          this.toastService.showError(`Failed to sign in with ${provider}. Please try again.`, 'Sign-In Error');
        }
      });
    }
  }
  private redirectAfterLogin(): void {
    const returnUrl = sessionStorage.getItem('/eturnUrl') || '/';
    this.cartService.refreshCartCount();
    sessionStorage.removeItem('returnUrl');
    this.router.navigateByUrl(returnUrl);
  }
  // -----------------------------
  // Standard Auth Methods
  // -----------------------------

  login(credentials: LoginRequest): ReturnType<typeof this.http.post<ApiResponse<string>>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/login`, credentials).pipe(
      tap({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.setAuthState(response.data);
            this.toastService.loginSuccess();
          } else {
            this.toastService.loginError();
          }
        },
        error: (error) => {
          this.clearAuthState();
          this.toastService.loginError();
        }
      })
    );
  }

  register(userData: RegisterRequest): ReturnType<typeof this.http.post<ApiResponse<string>>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/register`, userData).pipe(
      tap({
        next: (response) => {
          if (response.succeeded) {
            this.toastService.registrationSuccess();
          } else {
            this.toastService.registrationError();
          }
        },
        error: () => this.toastService.registrationError()
      })
    );
  }

  forgotPassword(request: ForgotPasswordRequest): ReturnType<typeof this.http.post<ApiResponse<boolean>>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/forgot-password`, request).pipe(
      tap({
        next: (response) => {
          if (response.succeeded) {
            this.toastService.passwordResetSuccess();
          } else {
            this.toastService.showError('Failed to send reset email. Please try again.', 'Password Reset Error');
          }
        },
        error: () => this.toastService.showError('Failed to send reset email. Please try again.', 'Password Reset Error')
      })
    );
  }

  resetPassword(request: ResetPasswordRequest): ReturnType<typeof this.http.post<ApiResponse<boolean>>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/reset-password`, request).pipe(
      tap({
        next: (response) => {
          if (response.succeeded) {
            this.toastService.passwordChangeSuccess();
          } else {
            this.toastService.showError('Failed to reset password. Please try again.', 'Password Reset Error');
          }
        },
        error: () => this.toastService.showError('Failed to reset password. Please try again.', 'Password Reset Error')
      })
    );
  }

  logout(): void {
    this.clearAuthState();
    this.toastService.logoutSuccess();
  }

  private setAuthState(token: string): void {
    if (token===null || token===undefined) {
      this.clearAuthState();
      return;
    }
    localStorage.setItem('token', token);
    const user = this.decodeToken(token);
    this.currentUserSubject.next(user);
    this.setAutoLogout(token);
  }

  private clearAuthState(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }

  private validateToken(token: string | null): boolean {
    if (!token) return false;
    try {
      const payload = this.getTokenPayload(token);
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private getTokenPayload(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      throw new Error('Invalid token format');
    }
  }

  private decodeToken(token: string): User {
    try {
      const payload = this.getTokenPayload(token);

      const nameIdentifier = payload.sub ||
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

      const emailClaim = payload.email ||
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];

      let roles: string[] = [];
      if (payload.role) {
        roles = Array.isArray(payload.role) ? payload.role : [payload.role];
      } else if (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) {
        const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
      }

      const fullNameParts = (payload.name || payload.fullName || '').split(' ');

      return {
        id: nameIdentifier || '',
        email: emailClaim || '',
        firstName: payload.given_name || payload.firstName || fullNameParts[0] || '',
        lastName: payload.family_name || payload.lastName || fullNameParts.slice(1).join(' ') || '',
        roles: roles.filter(role => !!role)
      };
    } catch (e) {
      console.error('Failed to decode token:', e);
      return this.getNullUser();
    }
  }

  private getNullUser(): User {
    return { id: '', email: '', firstName: '', lastName: '', roles: [] };
  }

  private setAutoLogout(token: string): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    try {
      const payload = this.getTokenPayload(token);
      const expiresIn = (payload.exp * 1000) - Date.now();
      const logoutTime = Math.max(0, expiresIn - 60000);

      if (logoutTime > 0) {
        this.tokenExpirationTimer = setTimeout(() => this.logout(), logoutTime);
      }
    } catch (e) {
      console.error('Failed to set auto-logout timer:', e);
    }
  }

  isAuthenticated(): boolean {
   const token = localStorage.getItem('token');
    if (!token) return false;
    return true;
    
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.some(role => user.roles.includes(role)) : false;
  }

  getCurrentUser(): User | null {
    this.setAuthState(localStorage.getItem('token')!);
    return this.currentUserSubject.value;
  }
  
}