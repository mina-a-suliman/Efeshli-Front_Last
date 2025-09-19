import { Component, OnInit, signal, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-email-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './EmailConfirmation.component.html',
    styleUrls: ['./EmailConfirmation.component.css']

 
  
})
export class EmailConfirmationComponent implements OnInit {
  isLoading = signal(true);
  isSuccess = signal(false);
  message = signal('');
  showDebugInfo = signal(false);
  debugEmail = signal('');
  debugToken = signal('');
  debugRawParams = signal('');
  currentUrl = signal('');
  extractedEmail = signal('');
  extractedToken = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

 ngOnInit(): void {
    console.log('🟢 EmailConfirmationComponent initialized');
    
    if (isPlatformBrowser(this.platformId)) {
      this.currentUrl.set(window.location.href);
      console.log('🌍 Running in browser, currentUrl =', this.currentUrl());
      this.confirmEmail();
    } else {
      console.log('⚠️ Running on server, skipping window.location');
      this.confirmEmail();
    }
  }

  confirmEmail(): void {
    console.log('🔍 confirmEmail() called');

    const params = this.route.snapshot.queryParams;
    console.log('📩 Raw Angular params =', params);

    let email: string | null = null;
    let token: string | null = null;

    const keys = Object.keys(params);
    this.debugRawParams.set(JSON.stringify(params, null, 2));

    // ✅ detect Gmail/Outlook redirect key (even if there are other params)
    const gmailKey = keys.find(k => k.includes('email='));

    if (gmailKey) {
      console.log('⚠️ Gmail/Outlook redirect detected, decoding manually...');
      const rawQuery = decodeURIComponent(gmailKey);
      console.log('🔑 rawQuery =', rawQuery);

      const searchParams = new URLSearchParams(rawQuery);
      email = searchParams.get('email');
      token = searchParams.get('token');
      console.log('📤 Extracted from Gmail redirect → email =', email, ', token =', token?.substring(0, 20) + '...');
    } else {
      console.log('✅ Normal query params case');
      email = params['email'] || null;
      token = params['token'] || null;
      console.log('📤 Extracted normal → email =', email, ', token =', token?.substring(0, 20) + '...');
    }

    // fallback لو لسه ناقص
    if ((!email || !token) && isPlatformBrowser(this.platformId)) {
      console.log('⚠️ Missing params, trying fallback via window.location');
      const extracted = this.extractParamsFromUrl();
      email = email || extracted.email;
      token = token || extracted.token;
      console.log('📤 Extracted via fallback → email =', email, ', token =', token?.substring(0, 20) + '...');
    }

    this.debugEmail.set(email || '');
    this.debugToken.set(token || '');
    this.extractedEmail.set(email || '');
    this.extractedToken.set(token || '');

    if (!email || !token) {
      console.error('❌ Invalid confirmation link. Missing email or token.');
      this.handleError('Invalid confirmation link. Missing email or token.');
      return;
    }

    console.log('🚀 Final Email:', email);
    console.log('🚀 Final Token (first 30 chars):', token.substring(0, 30) + '...');

    this.callConfirmationApi(email, token);
  }

  private extractParamsFromUrl(): { email: string | null; token: string | null } {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      return {
        email: url.searchParams.get('email'),
        token: url.searchParams.get('token')
      };
    }
    return { email: null, token: null };
  }

  private callConfirmationApi(email: string, token: string): void {
    console.log('📡 Calling API with:', { email, token: token.substring(0, 30) + '...' });

    this.http.post(
      `${environment.apiUrl}/auth/confirm-email`,
      { email, token }
    ).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
        this.message.set(response.message || 'Your email has been confirmed successfully!');
        console.log('✅ API success →', response);
      },
      error: (error) => {
        console.error('❌ API error →', error);
        this.handleError(
          error.error?.message || 
          'Email confirmation failed. The link may be expired or invalid.'
        );
      }
    });
  }

  private handleError(errorMessage: string): void {
    this.isLoading.set(false);
    this.isSuccess.set(false);
    this.message.set(errorMessage);
    console.error('⚠️ handleError():', errorMessage);
  }

  toggleDebug(): void {
    this.showDebugInfo.set(!this.showDebugInfo());
    console.log('🔧 Debug toggled, showDebugInfo =', this.showDebugInfo());
  }

  resendConfirmation(): void {
    const email = this.extractedEmail();
    if (!email) {
      console.warn('⚠️ resendConfirmation() called but no email found');
      return;
    }

    this.isLoading.set(true);
    console.log('📡 Resending confirmation to:', email);

    this.http.post(`${environment.apiUrl}/auth/resend-confirmation`, { email })
      .subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          this.isSuccess.set(true);
          this.message.set(response.message || 'A new confirmation email has been sent. Please check your inbox.');
          console.log('✅ Resend success →', response);
        },
        error: (error) => {
          console.error('❌ Resend error →', error);
          this.handleError(
            error.error?.message || 
            'Failed to resend confirmation email. Please try again later.'
          );
        }
      });
  }

  navigateToLogin(): void {
    const email = this.extractedEmail();
    console.log('➡️ Navigating to login with email:', email);
    this.router.navigate(['/login'], { queryParams: { email } });
  }
}