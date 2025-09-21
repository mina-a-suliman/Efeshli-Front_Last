// shared/full-cart/full-cart.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { StripeService } from '../../../core/services/Stripe.service';
import { CartService, CartDto, CartItemDto } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';  // 👈 import

@Component({
  selector: 'app-full-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './full-cart-items.html',
  styleUrls: ['./full-cart-items.css']
})
export class FullCartItemsComponent implements OnInit, OnDestroy {
  serverCart: CartDto | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  quantities: number[] = Array.from({ length: 100 }, (_, i) => i + 1);

  vatRate = 14;
  shippingMessage = 'Calculated at the next step.';

  selectedAddressId?: number = (() => {
    const raw = localStorage.getItem('addressId');
    const parsed = raw ? Number(raw) : undefined;
    return Number.isFinite(parsed as number) ? (parsed as number) : undefined;
  })();

  constructor(
    private stripeService: StripeService,
    private cartService: CartService,
    private router: Router,
    private toast: ToastService   // 👈 inject toast service
  ) {}

  ngOnInit(): void {
    this.loadCart();

    this.cartService.cartCount$.subscribe(() => {
      this.loadCart();
    });
  }

  ngOnDestroy(): void {}

  /** Load cart from API */
  loadCart(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const token = localStorage.getItem('token');
    if (!token) {
      this.isLoading = false;
      this.errorMessage = 'Please log in to view your cart';
      this.toast.showError(this.errorMessage, 'Cart'); // 👈 toast
      return;
    }

    this.cartService.getCart().subscribe({
      next: (resp) => {
        this.isLoading = false;
        if (resp.succeeded && resp.data) {
          this.serverCart = resp.data;
        } else {
          this.errorMessage = resp.message ?? 'Failed to load cart';
          this.serverCart = null;
          this.toast.showError(this.errorMessage, 'Cart'); // 👈 toast
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.serverCart = null;
        if (err.status === 401) {
          this.errorMessage = 'Please log in to view your cart';
        } else if (err.status === 403) {
          this.errorMessage = 'Access denied. Please check your permissions';
        } else if (err.status === 0) {
          this.errorMessage = 'Network error. Please check your connection';
        } else {
          this.errorMessage = err?.message || 'Failed to load cart';
        }
        this.toast.showError(this.errorMessage??'', 'Cart'); // 👈 toast
      }
    });
  }

  /** Calculations */
  get subtotal(): number {
    return this.serverCart?.grandTotal ?? 0;
  }

  get vatAmount(): number {
    return this.subtotal * (this.vatRate / 100);
  }

  get total(): number {
    return this.subtotal;
  }

  /** Cart actions */
  updateQuantity(item: CartItemDto, quantity: number): void {
    if (quantity <= 0) return;
    this.cartService.updateQuantity({ cartItemId: item.cartItemId, quantity }).subscribe({
      next: (resp) => {
        if (resp.succeeded) {
          this.loadCart();
          this.toast.showSuccess('Quantity updated', 'Cart'); // 👈 toast
        } else {
          this.toast.showError(resp.message || 'Failed to update quantity', 'Cart');
        }
      },
      error: () => this.toast.showError('Failed to update quantity', 'Cart')
    });
  }

  removeItem(item: CartItemDto): void {
    this.cartService.removeItem(item.cartItemId).subscribe({
      next: (resp) => {
        if (resp.succeeded) {
          this.loadCart();
          this.toast.showSuccess('Item removed from cart', 'Cart'); // 👈 toast
        } else {
          this.toast.showError(resp.message || 'Failed to remove item', 'Cart');
        }
      },
      error: () => this.toast.showError('Failed to remove item', 'Cart')
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: (resp) => {
        if (resp.succeeded) {
          this.loadCart();
          this.toast.showSuccess('Cart cleared', 'Cart'); // 👈 toast
        } else {
          this.toast.showError(resp.message || 'Failed to clear cart', 'Cart');
        }
      },
      error: () => this.toast.showError('Failed to clear cart', 'Cart')
    });
  }

  /** Navigation */
  startShopping() {
    this.router.navigateByUrl('/products?categoryId=514&categoryName=End%20%26%20Side%20Tables');
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  contactSupport(type: 'phone' | 'email'): void {
    if (type === 'phone') {
      window.location.href = 'tel:+201000748719';
    } else {
      window.location.href = 'mailto:hello@efreshii.com';
    }
  }
}
