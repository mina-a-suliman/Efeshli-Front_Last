import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { AuthService, ForgotPasswordRequest } from '../../../../core/services/auth.service';
import { ChangeDetectorRef, NgZone } from '@angular/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  submitted = false;
  loading = false;
  emailNotFound = false;
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
     private ngZone: NgZone
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Initialize form if needed
  }

  // Convenience getter for easy access to form fields
  get f() { return this.forgotPasswordForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.emailNotFound = false;
    this.successMessage = '';

    // Stop here if form is invalid
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.loading = true;

    const request: ForgotPasswordRequest = {
      email: this.forgotPasswordForm.value.email
    };

    this.authService.forgotPassword(request)
      .pipe(
        finalize(() => {this.loading = false;  
             this.ngZone.run(() => this.cdr.detectChanges());
})
        
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded) {

            // Show success state with the message from the image
            this.successMessage =response.message; 
            // 'We have e-mailed your password reset link!';
            this.loading = false
          } else {
            // Handle API errors that aren't HTTP errors
            this.emailNotFound = true;
            this.loading = false
          }
        },
        error: (error) => {
          // Handle HTTP errors
          console.error('Password reset error:', error);
          this.emailNotFound = true;
          this.loading = false
        }
      });
  }
}