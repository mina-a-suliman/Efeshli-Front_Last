import { Component, Inject, OnInit, PLATFORM_ID, signal, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router'; // ✅ Added ActivatedRoute
import { ApiResponse, AuthService, LoginRequest } from '../../../../core/services/auth.service';

@Component({
  selector: 'login',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute, // ✅ Inject ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      
      alert('You are already logged in.');
      this.router.navigate(['/home']);
    }
  }

  get email() { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const credentials: LoginRequest = this.loginForm.value as LoginRequest;

    this.authService.login(credentials).subscribe({
      next: (response: ApiResponse<string>) => {
        this.isLoading.set(false);
        if (response.succeeded && response.data) {
          this.redirectAfterLogin();
        } else {
          this.handleFailedResponse(response);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.handleError(error);
      }
    });
  }

  // --- Google Sign-In ---
  signInWithGoogle(): void {
    const currentReturnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    sessionStorage.setItem('returnUrl', currentReturnUrl);
    this.authService.loginWithGoogle();
  }

  // --- Facebook Sign-In ---
  signInWithFacebook(): void {
    const currentReturnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    sessionStorage.setItem('returnUrl', currentReturnUrl);
    this.authService.loginWithFacebook();
  }

  // --- Redirect Helper ---
  private redirectAfterLogin(): void {
    const returnUrl = sessionStorage.getItem('returnUrl') || '/home';
    sessionStorage.removeItem('returnUrl');
    this.router.navigateByUrl(returnUrl);
  }

  // --- Error Handling ---
  private handleFailedResponse(response: ApiResponse<string>): void {
    this.errorMessage.set(response.errors?.join(', ') || response.message || 'Login failed');
  }

  private handleError(error: any): void {
    if (error.status === 0) {
      this.errorMessage.set('Network error. Please check your internet connection.');
    } else if (error.status === 401) {
      this.errorMessage.set('Invalid email or password.');
    } else {
      this.errorMessage.set(error.error?.message || 'An unexpected error occurred.');
    }
  }

  private markAllAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }
}