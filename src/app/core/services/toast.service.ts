import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastr = inject(ToastrService);

  // Success messages
  showSuccess(message: string, title: string = 'Success') {
    this.toastr.success(message, title);
  }

  // Error messages
  showError(message: string, title: string = 'Error') {
    this.toastr.error(message, title);
  }

  // Warning messages
  showWarning(message: string, title: string = 'Warning') {
    this.toastr.warning(message, title);
  }

  // Info messages
  showInfo(message: string, title: string = 'Info') {
    this.toastr.info(message, title);
  }

  // Custom toast with options
  showCustom(message: string, title: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    switch (type) {
      case 'success':
        this.showSuccess(message, title);
        break;
      case 'error':
        this.showError(message, title);
        break;
      case 'warning':
        this.showWarning(message, title);
        break;
      case 'info':
        this.showInfo(message, title);
        break;
    }
  }

  // Clear all toasts
  clear() {
    this.toastr.clear();
  }

  // Specific success messages for common actions
  loginSuccess() {
    this.showSuccess('Login successful!', 'Welcome back');
  }

  logoutSuccess() {
    this.showSuccess('Logged out successfully', 'Goodbye');
  }

  registrationSuccess() {
    this.showSuccess('Account created successfully!', 'Welcome');
  }

  passwordResetSuccess() {
    this.showSuccess('Password reset email sent', 'Check your inbox');
  }

  passwordChangeSuccess() {
    this.showSuccess('Password changed successfully', 'Security updated');
  }

  profileUpdateSuccess() {
    this.showSuccess('Profile updated successfully', 'Changes saved');
  }

  // Product related success messages
  productAddedToCart() {
    this.showSuccess('Product added to cart', 'Shopping');
  }

  productRemovedFromCart() {
    this.showSuccess('Product removed from cart', 'Updated');
  }

  productAddedToWishlist() {
    this.showSuccess('Added to wishlist', 'Favorites');
  }

  productRemovedFromWishlist() {
    this.showSuccess('Removed from wishlist', 'Favorites');
  }

  // Order related success messages
  orderPlacedSuccess() {
    this.showSuccess('Order placed successfully!', 'Thank you');
  }

  orderCancelledSuccess() {
    this.showSuccess('Order cancelled successfully', 'Updated');
  }

  // Payment related success messages
  paymentSuccess() {
    this.showSuccess('Payment processed successfully', 'Payment complete');
  }

  paymentFailed() {
    this.showError('Payment failed. Please try again', 'Payment error');
  }

  // Address related success messages
  addressAddedSuccess() {
    this.showSuccess('Address added successfully', 'Location saved');
  }

  addressUpdatedSuccess() {
    this.showSuccess('Address updated successfully', 'Location updated');
  }

  addressDeletedSuccess() {
    this.showSuccess('Address deleted successfully', 'Location removed');
  }

  // Error messages for common failures
  loginError() {
    this.showError('Login failed. Please check your credentials', 'Authentication error');
  }

  registrationError() {
    this.showError('Registration failed. Please try again', 'Sign up error');
  }

  networkError() {
    this.showError('Network error. Please check your connection', 'Connection failed');
  }

  serverError() {
    this.showError('Server error. Please try again later', 'Service unavailable');
  }

  validationError(message: string = 'Please check your input') {
    this.showError(message, 'Validation error');
  }

  unauthorizedError() {
    this.showError('You are not authorized to perform this action', 'Access denied');
  }

  notFoundError() {
    this.showError('The requested resource was not found', 'Not found');
  }
}
