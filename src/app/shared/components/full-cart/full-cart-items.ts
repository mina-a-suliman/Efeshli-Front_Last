

// shared/full-cart/full-cart.component.ts
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { StripeService } from '../../../core/services/Stripe.service';
import { CartService, CartDto, CartItemDto } from '../../../core/services/cart.service';
import { Address } from '../../../core/services/Account.service';

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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();

    // Refresh if cart count changes
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
    return this.subtotal; // API already returns grandTotal including discounts
  }

  /** Cart actions */
  updateQuantity(item: CartItemDto, quantity: number): void {
    if (quantity <= 0) return;
    this.cartService.updateQuantity({ cartItemId: item.cartItemId, quantity }).subscribe({
      next: (resp) => {
        if (resp.succeeded) this.loadCart();
      }
    });
  }

  removeItem(item: CartItemDto): void {
    this.cartService.removeItem(item.cartItemId).subscribe({
      next: (resp) => {
        if (resp.succeeded) this.loadCart();
      }
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: (resp) => {
        if (resp.succeeded) this.loadCart();
      }
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