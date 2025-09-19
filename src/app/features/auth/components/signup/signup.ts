import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiResponse, AuthService, RegisterRequest } from '../../../../core/services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute, // ✅ Inject ActivatedRoute
  ) 

{
    this.signupForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword && confirmPassword.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    
    return null;
  };

  get firstName() { return this.signupForm.get('firstName')!; }
  get lastName() { return this.signupForm.get('lastName')!; }
  get email() { return this.signupForm.get('email')!; }
  get phoneNumber() { return this.signupForm.get('phoneNumber')!; }
  get password() { return this.signupForm.get('password')!; }
  get confirmPassword() { return this.signupForm.get('confirmPassword')!; }

  togglePassword(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formData: RegisterRequest = this.signupForm.value;

    this.authService.register(formData).subscribe({
      next: (response: ApiResponse<string>) => {
        this.isLoading.set(false);
        
        if (response.succeeded) {
          this.successMessage.set(response.message);
          
          this.signupForm.disable();
          
        } else {
          this.errorMessage.set(response.message || 'Registration failed. Please try again.');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        
        if (error.error?.errors) {
          const errorMessages = Object.values(error.error.errors).flat();
          this.errorMessage.set(errorMessages.join(', ') || 'Registration failed. Please check your inputs.');
        } else {
          this.errorMessage.set(
            error.error?.message || 
            'Registration failed. Please try again later.'
          );
        }
      }
    });
  }

  private markAllAsTouched(): void {
    Object.keys(this.signupForm.controls).forEach(key => {
      this.signupForm.get(key)?.markAsTouched();
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
}



