import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService, ResetPasswordRequest } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  imports:[ReactiveFormsModule,CommonModule],
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  showNewPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  email = '';
  token = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6),
        this.passwordValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Get email and token from query parameters
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';
      
      if (!this.email || !this.token) {
        this.errorMessage = 'Invalid reset link. Please request a new password reset.';
      }
    });
  }

  // Custom password validator
  passwordValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    const errors: any = {};

    // Require digit
    if (!/\d/.test(value)) {
      errors.requireDigit = true;
    }

    // Require lowercase
    if (!/[a-z]/.test(value)) {
      errors.requireLowercase = true;
    }

    // Require uppercase
    if (!/[A-Z]/.test(value)) {
      errors.requireUppercase = true;
    }

    // Require non-alphanumeric
    if (!/[^a-zA-Z0-9]/.test(value)) {
      errors.requireNonAlphanumeric = true;
    }

    // Require unique chars (at least 1 unique character)
    const uniqueChars = new Set(value).size;
    if (uniqueChars < 2) { // At least 1 unique char beyond the minimum length requirement
      errors.requireUniqueChars = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  // Password match validator
  passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return password && confirmPassword && password === confirmPassword 
      ? null 
      : { passwordMismatch: true };
  }

  togglePassword(field: 'new' | 'confirm'): void {
    if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.email || !this.token) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: ResetPasswordRequest = {
      email: this.email,
      token: this.token,
      newPassword: this.resetForm.get('newPassword')?.value,
      confirmPassword: this.resetForm.get('confirmPassword')?.value
    };

    this.authService.resetPassword(request)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.successMessage = 'Password reset successfully! Redirecting to login...';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.errorMessage = response.message || 'Failed to reset password';
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'An error occurred. Please try again.';
        }
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.resetForm.controls).forEach(key => {
      const control = this.resetForm.get(key);
      control?.markAsTouched();
    });
  }

  getPasswordErrors(): string {
    const errors = this.resetForm.get('newPassword')?.errors;
    if (!errors) return '';

    const errorMessages: string[] = [];

    if (errors['required']) {
      errorMessages.push('Password is required');
    }
    if (errors['minlength']) {
      errorMessages.push(`Minimum length is ${errors['minlength'].requiredLength} characters`);
    }
    if (errors['requireDigit']) {
      errorMessages.push('Must contain at least one digit (0-9)');
    }
    if (errors['requireLowercase']) {
      errorMessages.push('Must contain at least one lowercase letter (a-z)');
    }
    if (errors['requireUppercase']) {
      errorMessages.push('Must contain at least one uppercase letter (A-Z)');
    }
    if (errors['requireNonAlphanumeric']) {
      errorMessages.push('Must contain at least one special character');
    }
    if (errors['requireUniqueChars']) {
      errorMessages.push('Must contain at least one unique character');
    }

    return errorMessages.join(', ');
  }
}