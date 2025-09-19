// // stripe.service.ts
// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';

// // must match your backend DTO
// export interface CreateCheckoutSessionRequest {
//   addressId: number;
//   couponCode?: string;
//   successUrl: string;
//   cancelUrl: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class StripeService {
//   private apiUrl = 'https://localhost:5104/api/Payments';

//   constructor(private http: HttpClient) {}

//   createCheckoutSession(body: CreateCheckoutSessionRequest): Observable<any> {
//     // return this.http.post<any>(`${this.apiUrl}/create-checkout-session`, body);
//     return this.http.post<any>(`https://localhost:5104/api/Payments/create-checkout-session`, body);
//   }
// }


// import { Injectable } from '@angular/core';
// import { loadStripe, Stripe } from '@stripe/stripe-js';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../environments/environment';

// @Injectable({ providedIn: 'root' })
// export class StripeService {
//   private stripePromise: Promise<Stripe | null>;
//   constructor(private http: HttpClient) {
//     this.stripePromise = loadStripe(environment.stripePublicKey);
//   }

//   async checkout(addressId: number, couponCode?: string) {
//     const body = {
//       AddressId: addressId,
//       CouponCode: couponCode || '',
//       SuccessUrl: `${window.location.origin}/checkout -success`,
//       CancelUrl: `${window.location.origin}/checkout-cancel`
//     };
//     const session: any = await this.http
//       .post(`${environment.apiUrl}/Payments/create-checkout-session`, body)
//       .toPromise();
//     const stripe = await this.stripePromise;
//     if (!stripe) throw new Error('Stripe failed to load');
//     await stripe.redirectToCheckout({ sessionId: session.sessionId });
//   }
// }

import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { from, switchMap, map, catchError, throwError } from 'rxjs';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class StripeService {
  private stripePromise: Promise<Stripe | null>;

  constructor(private http: HttpClient, private toastService: ToastService) {
    this.stripePromise = loadStripe(environment.stripePublicKey);
  }

  checkout(addressId: number, couponCode?: string) {
    const body = {
      AddressId: addressId,
      CouponCode: couponCode || '',
      SuccessUrl: `${window.location.origin}/checkout-success`,
      CancelUrl: `${window.location.origin}/checkout-cancel`
    };

    return this.http
      .post<{ sessionId: string }>(
        `${environment.apiUrl}/Payments/create-checkout-session`,
        body
      )
      .pipe(
        switchMap(session =>
          from(this.stripePromise).pipe(
            switchMap(stripe => {
              if (!stripe) {
                this.toastService.showError('Stripe failed to load', 'Payment Error');
                throw new Error('Stripe failed to load');
              }
              this.toastService.showInfo('Redirecting to payment...', 'Payment');
              return from(stripe.redirectToCheckout({ sessionId: session.sessionId }));
            })
          )
        ),
        catchError(error => {
          this.toastService.showError('Failed to process payment', 'Payment Error');
          return throwError(() => error);
        })
      );
  }
}
