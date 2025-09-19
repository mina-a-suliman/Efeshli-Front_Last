import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { WishlistDropdownComponent } from '../wishlist/wishlist-dropdown.component';
import { WishlistService } from '../../core/services/Wishlist.service';

@Component({
  selector: 'app-product-heart-button',
  template: `
    <div class="heart-button-container" [class]="position">
      <button class="heart-button"
              [class.active]="isInAnyWishlist"
              [class.loading]="loading"
              [class]="size"
              (click)="removeFromWishlist(productId)">
        <svg xmlns="http://www.w3.org/2000/svg" width="33.3" height="33.3" viewBox="0 0 33.3 33.3"><g data-name="Add Wishlist"><g data-name="Group 79975"><path data-name="bg oval" d="M16.45 0A16.45 16.45 0 1 1 0 16.45 16.45 16.45 0 0 1 16.45 0z" transform="translate(.2 .2)" style="transition: 0.3s; opacity: 0.162; fill: rgb(237, 28, 35);"></path><path data-name="" d="M13.947 1.168a4.311 4.311 0 0 1 1.241 3.122 4.311 4.311 0 0 1-1.241 3.122L7.594 14.02 1.241 7.412A4.311 4.311 0 0 1 0 4.29a4.311 4.311 0 0 1 1.241-3.122A3.536 3.536 0 0 1 3.925 0a3.536 3.536 0 0 1 2.683 1.168l.986 1.022 1.022-1.022a3.624 3.624 0 0 1 5.33 0z" transform="translate(9.2 9.639)" style="transition: 0.3s; fill: rgb(237, 28, 35);"></path></g></g></svg>
      </button>

      <!-- Wishlist Dropdown -->
      <app-wishlist-dropdown
        [productId]="productId"
        [isVisible]="showDropdown"
        (close)="closeDropdown()"
        (itemAdded)="onItemAdded($event)"
        (itemRemoved)="onItemRemoved($event)">
      </app-wishlist-dropdown>
    </div>
  `,
  styles: [`
    .heart-button-container {
      position: relative;
    }

    .heart-button {
      background: rgba(255, 255, 255, 0.9); 
      border:none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .heart-button:hover {
      background: white;
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .heart-button.small {
      width: 28px;
      height: 28px;
    }

    .heart-button.large {
      width: 44px;
      height: 44px;
    }

    .heart-button i {
      color: rgb(237, 28, 35);
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .heart-button.small i {
      font-size: 12px;
    }

    .heart-button.large i {
      font-size: 16px;
    }

    .heart-button.active i {
      color: #e91e63;
    }

    .heart-button.loading {
      cursor: not-allowed;
    }

    .heart-button-container.top-right {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 10;
    }

    .heart-button-container.top-left {
      position: absolute;
      top: 8px;
      left: 8px;
      z-index: 10;
    }

    .heart-button-container.center {
      display: flex;
      justify-content: center;
    }
    .heart-button svg {
  pointer-events: none; /* يخلي الماوس يتعامل مع البوتون مش الـ SVG */
}

.heart-button {
  cursor: pointer !important; /* تأكيد إن البوتون نفسه عليه pointer */
}
  `],
  imports: [CommonModule, WishlistDropdownComponent],
  standalone: true
})
export class ProductHeartButtonComponent implements OnInit, OnDestroy {
  @Input() productId!: number;
  @Input() wishlistId!: number;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() position: 'top-right' | 'top-left' | 'center' = 'center';
  @Output() wishlistChanged = new EventEmitter<{ productId: number, inWishlist: boolean }>();

  isInAnyWishlist = false;
  loading = false;
  showDropdown = false;

  private destroy$ = new Subject<void>();

  constructor(private wishlistService: WishlistService) {}

  ngOnInit() {
    if (this.productId) {
      this.checkWishlistStatus();
    }
    console.log('ProductHeartButtonComponent initialized with productId:', this.productId);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkWishlistStatus() {
    this.loading = true;
    console.log('Checking wishlist status for productId:', this.productId);
    // Check if product is in any wishlist
    this.wishlistService.getWishlistsDropdown(this.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
           console.log('Wishlist status response:', response);
          
          if (response.succeeded && response.data) {
            this.isInAnyWishlist = response.data.some(w => w.isInWishlist);
            console.log('Product is in wishlist:', this.isInAnyWishlist);
          } else {
            this.isInAnyWishlist = false;
            console.log('No wishlist data or request failed');
          }
        },
        error: (error) => {
          console.error('Error checking wishlist status:', error);
        }
      });
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    
    if (!this.productId || this.loading) return;
    
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown() {
    this.showDropdown = false;
  }
removeFromWishlist(productId: number) {
  if (!this.wishlistId) {
    console.error('No wishlistId provided!');
    return;
  }

  this.wishlistService.removeItemFromWishlist(this.wishlistId, productId)
    .subscribe(success => {
      if (success) {
        this.isInAnyWishlist = false;
        this.wishlistChanged.emit({ productId, inWishlist: false });
      }
    });
}


  onItemAdded(event: { wishlistId: number, productId: number }) {
    this.isInAnyWishlist = true;
    this.wishlistChanged.emit({ productId: event.productId, inWishlist: true });
    this.closeDropdown();
  }

  onItemRemoved(event: { wishlistId: number, productId: number }) {
    // Re-check if still in any other wishlist
    this.checkWishlistStatus();
    this.wishlistChanged.emit({ productId: event.productId, inWishlist: false });
  }
}