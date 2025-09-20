// // shared/full-cart/full-cart.component.ts
// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { StripeService } from '../../../core/services/Stripe.service';
// import { CartService, CartDto, CartItemDto } from '../../../core/services/cart.service';
// import { Router } from '@angular/router';
// // interface CartItem {
// // 	id: number;
// // 	name: string;
// // 	imageUrl: string;
// // 	dimensions: string;
// // 	fabric: string;
// // 	fabricColor: string;
// // 	wood: string;
// // 	woodColor: string;
// // 	price: number;
// // 	quantity: number;
// // 	readyToShip: boolean;
// // }

// @Component({
//   selector: 'app-full-cart',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './full-cart-items.html',
//   styleUrls: ['./full-cart-items.css'] // تغيير من scss إلى css
// })
// export class FullCartItemsComponent implements OnInit, OnDestroy {
  
// selectedQty = 3;
//   isDropdownOpen = false;

//   toggleDropdown() {
//     this.isDropdownOpen = !this.isDropdownOpen;
//   }

//   selectQty(qty: number) {
//     this.selectedQty = qty;
//     this.isDropdownOpen = false;
//   }


//   // Server cart state
//   serverCart: CartDto | null = null;
//   isLoading = false;
//   errorMessage: string | null = null;
// quantities: number[] = Array.from({ length: 100 }, (_, i) => i + 1);
//   // Legacy UI fields kept for now; image/options can be mapped later
//   // cartItems: CartItem[] = [];

//   vatRate = 14;
//   shippingMessage = 'Calculated at the next step.';
//   selectedAddressId?: number = (() => {
//     const raw = localStorage.getItem('addressId');
//     const parsed = raw ? Number(raw) : undefined;
//     return Number.isFinite(parsed as number) ? (parsed as number) : undefined;
//   })();

//   constructor(private stripeService: StripeService, private cartService: CartService, private router:Router) {}

//   ngOnInit(): void {
//     this.loadCart();
    
//     // Listen for cart count changes to refresh cart
//     this.cartService.cartCount$.subscribe(count => {
//       if (count > 0 && this.cartItems.length === 0) {
//         this.loadCart();
//       }
//     });
//   }

//   ngOnDestroy(): void {
//     // Cleanup if needed
//   }

//   // Method to refresh cart from external components
//   refreshCart(): void {
//     this.loadCart();
//   }

//   loadCart(): void {
//     this.isLoading = true;
//     this.errorMessage = null;
    
//     // Check authentication first
//     const token = localStorage.getItem('token');
//     if (!token) {
//       this.isLoading = false;
//       this.errorMessage = 'Please log in to view your cart';
//       return;
//     }
    
//     this.cartService.getCart().subscribe({
//       next: (resp) => {
//         this.isLoading = false;
        
//         if (resp.succeeded && resp.data) {
//           this.serverCart = resp.data;
          
//           // Check if items array exists and is not empty
//           if (resp.data.items && Array.isArray(resp.data.items) && resp.data.items.length > 0) {
//             this.cartItems = resp.data.items.map((it: CartItemDto) => ({
//               id: it.cartItemId,
//               name: it.productName || 'Unknown Product',
//               imageUrl: it.imageUrls.at(0) || '/assets/placeholder.png',
//               dimensions: '',
//               fabric: '',
//               fabricColor: '#ffffff',
//               wood: '',
//               woodColor: '#ffffff',
//               price: Number(it.price) || 0,
//               quantity: Number(it.quantity) || 1,
//               readyToShip: true
//             }));
//           } else {
//             this.cartItems = [];
//           }
//         } else {
//           this.errorMessage = resp.message ?? 'Failed to load cart';
//           this.cartItems = [];
//         }
//       },
//       error: (err) => {
//         this.isLoading = false;
//         this.cartItems = [];
        
//         // Handle specific error types
//         if (err.status === 401) {
//           this.errorMessage = 'Please log in to view your cart';
//         } else if (err.status === 403) {
//           this.errorMessage = 'Access denied. Please check your permissions';
//         } else if (err.status === 0) {
//           this.errorMessage = 'Network error. Please check your connection';
//         } else {
//           this.errorMessage = (err as any)?.message || 'Failed to load cart';
//         }
//       }
//     });
//   }
//   startShopping() {
//     this.router.navigate(['/home']);
//   }



//   get subtotal(): number {
//     if (this.serverCart) return Number(this.serverCart.grandTotal);
//     return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//   }

//   get vatAmount(): number {
//     return this.subtotal * (this.vatRate / 100);
//   }

//   get total(): number {
//     return this.subtotal;
//   }

//   updateQuantity(item: CartItem, quantity: number): void {
//     if (quantity <= 0) return;
//     const cartItem = this.serverCart?.items.find(i => i.cartItemId === item.id);
//     if (!cartItem) return;
//     this.cartService.updateQuantity({ cartItemId: cartItem.cartItemId, quantity }).subscribe({
//       next: (resp: { succeeded: boolean }) => {
//         if (resp.succeeded) this.loadCart();
//       },
//       error: () => {}
//     });
//   }

//   removeItem(itemId: number): void {
//     this.cartService.removeItem(itemId).subscribe({
//       next: (resp: { succeeded: boolean }) => {
//         if (resp.succeeded) this.loadCart();
//       },
//       error: () => {}
//     });
//   }

//   clearCart(): void {
//     this.cartService.clearCart().subscribe({
//       next: (resp: { succeeded: boolean }) => {
//         if (resp.succeeded) this.loadCart();
//       },
//       error: () => {}
//     });
//   }

//   downloadCart(): void {
//     // Implement download cart functionality
//     console.log('Download cart functionality');
//   }

//   proceedToCheckout(): void {
//     // if (!this.selectedAddressId) {
//     //   alert('Please add/select a delivery address first.');
//     //   return;
//     // }
//     // this.stripeService.checkout(this.selectedAddressId);
//     this.router.navigate(['/checkout']);
//   }

//   contactSupport(type: 'phone' | 'email'): void {
//     if (type === 'phone') {
//       window.location.href = 'tel:+201000748719';
//     } else {
//       window.location.href = 'mailto:hello@efreshii.com';
//     }
//   }

//   // Helper methods for cart styling
//   getItemDimensions(index: number): string {
//     const dimensions = [
//       'W 60 x D 60 x H 40 cm \\ H 54, H 80 cm including Pillow',
//       'D 11 x H 32 cm',
//       'Face Towels: 100 x 50 Bath Towels: 140 x 70 Hand Towels: 30 X 30',
//       '30x 30 cm'
//     ];
//     return dimensions[index] || '';
//   }

//   getOriginalPrice(index: number): string {
//     const originalPrices = ['5,499', '96'];
//     return originalPrices[index === 0 ? 0 : 1] || '';
//   }
// }


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
    this.router.navigate(['/home']);
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