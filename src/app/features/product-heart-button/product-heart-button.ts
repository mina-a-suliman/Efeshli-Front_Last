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
              (click)="onHeartClick($event)">
               <!-- Empty Heart SVG - shown when NOT in wishlist -->
        <svg *ngIf="!isInAnyWishlist" 
             xmlns="http://www.w3.org/2000/svg" 
             width="33.3" 
             height="33.3" 
             viewBox="0 0 33.3 33.3">
          <g data-name="Add Wishlist">
            <g data-name="Group 79975">
              <path data-name="bg oval" 
                    d="M16.45 0A16.45 16.45 0 1 1 0 16.45 16.45 16.45 0 0 1 16.45 0z" 
                    transform="translate(.2 .2)" 
                    style="transition: 0.3s; stroke: rgb(0, 0, 0); fill: rgba(0, 0, 0, 0.56); stroke-width: 0.4px; opacity: 0.054;">
              </path>
              <path data-name="" 
                    d="M13.947 1.168a4.311 4.311 0 0 1 1.241 3.122 4.311 4.311 0 0 1-1.241 3.122L7.594 14.02 1.241 7.412A4.311 4.311 0 0 1 0 4.29a4.311 4.311 0 0 1 1.241-3.122A3.536 3.536 0 0 1 3.925 0a3.536 3.536 0 0 1 2.683 1.168l.986 1.022 1.022-1.022a3.624 3.624 0 0 1 5.33 0z" 
                    transform="translate(9.2 9.639)" 
                    style="transition: 0.3s; fill: none; stroke-width: 0.7px; stroke: rgb(0, 0, 0);">
              </path>
            </g>
          </g>
        </svg>

        <!-- Filled Heart SVG - shown when IN wishlist -->
        <svg *ngIf="isInAnyWishlist" 
             xmlns="http://www.w3.org/2000/svg" 
             width="33.3" 
             height="33.3" 
             viewBox="0 0 33.3 33.3">
          <g data-name="Add Wishlist">
            <g data-name="Group 79975">
              <path data-name="bg oval" 
                    d="M16.45 0A16.45 16.45 0 1 1 0 16.45 16.45 16.45 0 0 1 16.45 0z" 
                    transform="translate(.2 .2)" 
                    style="transition: 0.3s; opacity: 0.162; fill: rgb(237, 28, 35);">
              </path>
              <path data-name="" 
                    d="M13.947 1.168a4.311 4.311 0 0 1 1.241 3.122 4.311 4.311 0 0 1-1.241 3.122L7.594 14.02 1.241 7.412A4.311 4.311 0 0 1 0 4.29a4.311 4.311 0 0 1 1.241-3.122A3.536 3.536 0 0 1 3.925 0a3.536 3.536 0 0 1 2.683 1.168l.986 1.022 1.022-1.022a3.624 3.624 0 0 1 5.33 0z" 
                    transform="translate(9.2 9.639)" 
                    style="transition: 0.3s; fill: rgb(237, 28, 35);">
              </path>
            </g>
          </g>
        </svg>
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
      top: -2px;
      right: -2px;
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
        position: relative;
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
  @Input() size: 'small' | 'center' | 'medium' | 'large' = 'medium';
  //@Output() wishlistChanged = new EventEmitter<{ productId: number, inWishlist: boolean }>();
  @Input() position: 'top-left' | 'top-right' | 'center' | 'static' = 'top-right';
  @Input() mode: 'dropdown' | 'remove' = 'dropdown'; // ✅ المود الجديد
  @Output() wishlistToggled = new EventEmitter<{ productId: number, added: boolean }>(); // ✅ Change event name and structure
  @Input() initialWishlistStatus: boolean = false; // ✅ input جديد لحالة الـ wishlist الأولية

  isInAnyWishlist = false;
  loading = false;
  initialLoading = false;
  showDropdown = false;
  statusChecked = false; 
  private destroy$ = new Subject<void>();

  constructor(private wishlistService: WishlistService) {}

  ngOnInit() {

    console.log('ProductHeartButtonComponent initialized with productId:', this.productId);
    // ✅ استخدام الحالة الأولية من الـ input إذا كانت متوفرة
    this.isInAnyWishlist = this.initialWishlistStatus;
    
    // إذا لم تتوفر الحالة الأولية، تحقق من الـ API فقط عند الحاجة
    if (this.initialWishlistStatus === false && this.productId) {
      // لا نتحقق تلقائياً، سننتظر حتى يضغط المستخدم على القلب
      this.statusChecked = false;
    } else {
      // إذا تم توفير الحالة الأولية، اعتبر أنه تم التحقق
      this.statusChecked = true;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkWishlistStatus() {
    if (!this.productId) {
      return;
    }

    // تجنب التحقق المتكرر إذا كنا في حالة تحميل
    if (this.initialLoading) {
      return;
    }
    this.initialLoading = true;
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
            this.statusChecked = true; // تم التحقق
          } else {
            this.isInAnyWishlist = false;
            console.log('No wishlist data or request failed');
          }
          this.initialLoading = false;

        },
        error: (error) => {
          console.error('Error checking wishlist status:', error);
          this.initialLoading = false;

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
// In product-heart-button.component.ts
removeFromWishlist(productId: number): void {
  if (!this.wishlistId) {
    console.error('❌ No wishlistId provided!');
    return;
  }

  console.log('🔄 Removing product from wishlist...', {
    productId,
    wishlistId: this.wishlistId
  });

  this.loading = true;

  this.wishlistService.removeItemFromWishlist(this.wishlistId, productId)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (success) => {
        console.log('✅ Remove result:', success);
        this.loading = false;
        
        if (success) {
          this.isInAnyWishlist = false;
          this.wishlistToggled.emit({ productId, added: false });
          console.log('✅ Product removed successfully');
        } else {
          console.error('❌ Remove failed - API returned false');
        }
      },
      error: (error) => {
        console.error('❌ Remove error:', error);
        this.loading = false;
      }
    });
}

// In product-heart-button.component.ts
onHeartClick(event: Event): void {
  event.stopPropagation();
  event.preventDefault();
  
  console.log('❤️ Heart clicked!', {
    productId: this.productId,
    wishlistId: this.wishlistId,
    mode: this.mode,
    isInAnyWishlist: this.isInAnyWishlist,
    loading: this.loading,
    initialLoading: this.initialLoading
  });
  
  if (this.productId === null || this.productId === undefined || this.loading) {
    console.log('❌ Blocked:', {
      productId: this.productId,
      loading: this.loading,
      reason: this.productId === null || this.productId === undefined ? 'Missing productId' : 'Loading'
    });
    return;
  }
  if (!this.statusChecked && !this.initialLoading) {
      this.checkWishlistStatus();
    }
  if (this.mode === 'dropdown') {
    // Show dropdown for adding to multiple wishlists
    console.log('📋 Opening dropdown...');
    this.showDropdown = !this.showDropdown;
  } else if (this.mode === 'remove') {
    // Direct removal from specific wishlist
    console.log('🗑️ Removing from wishlist...');
    if (!this.wishlistId) {
      console.error('❌ No wishlistId provided for remove mode!');
      return;
    }
    this.removeFromWishlist(this.productId);
  }
}
  onItemAdded(event: { wishlistId: number, productId: number }) {
    this.isInAnyWishlist = true;
    this.wishlistToggled.emit({ productId: event.productId, added: true });
    this.closeDropdown();
    this.showDropdown = false; 
  }

  onItemRemoved(event: { wishlistId: number, productId: number }) {
    // Re-check if still in any other wishlist
    this.statusChecked = false; // إعادة تعيين الفلاج
    this.checkWishlistStatus();
    this.wishlistToggled.emit({ productId: event.productId, added: false });
    
  }
 
}
