// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../environments/environment';

// @Injectable({
//   providedIn: 'root'
// })
// export class PaymentService {
//   private baseUrl = `${environment.apiUrl}/Payments`;

//   constructor(private http: HttpClient) {}

//   async createCheckoutSession(paymentDto: any) {
//     return this.http.post<any>(`${this.baseUrl}/create-checkout-session`, paymentDto)
//       .toPromise()
//       .then(async (res: any) => {
//         if (res && res.url) {
//           window.location.href = res.url;
//         }
//       });
//   }
// }
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { from, switchMap, tap, catchError, throwError } from 'rxjs';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = `${environment.apiUrl}/Payments`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  createCheckoutSession(paymentDto: any) {
    return from(loadStripe(environment.stripePublicKey)).pipe(
      switchMap(stripe => {
        if (!stripe) {
          this.toastService.showError('Stripe failed to load', 'Payment Error');
          throw new Error('Stripe failed to load');
        }
        return this.http.post<{ url: string }>(
          `${this.baseUrl}/create-checkout-session`,
          paymentDto
        );
      }),
      tap(res => {
        if (res && res.url) {
          this.toastService.showInfo('Redirecting to payment...', 'Payment');
          window.location.href = res.url;
        }
      }),
      catchError(error => {
        this.toastService.showError('Failed to create checkout session', 'Payment Error');
        return throwError(() => error);
      })
    );
  }
}
