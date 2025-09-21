import { AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe, NgIf, NgFor, TitleCasePipe, KeyValuePipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal, computed, DestroyRef, inject, HostListener, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, map, of, Observable } from 'rxjs';
import { ProductService } from '../../../../core/services/product.service';
import { Iproduct } from '../../../../core/models/product.model';
import { ProductHeartButtonComponent } from "../../../product-heart-button/product-heart-button";
import { WishlistService } from '../../../../core/services/Wishlist.service';
import { WishlistDropdownComponent } from '../../../wishlist/wishlist-dropdown.component';

import { ProductReviewsComponent } from '../../product-review/product-review.component';
import { AddToCartRequestDto, CartService } from '../../../../core/services/cart.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  templateUrl: './product-details.html',
  styleUrls: ['./product-details.css'],
  imports: [ProductReviewsComponent, RouterLink, CurrencyPipe, DatePipe, KeyValuePipe, WishlistDropdownComponent, CommonModule, NgIf, NgFor, ProductHeartButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProductDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private destroyRef = inject(DestroyRef);
  private wishlistService = inject(WishlistService);
  private cartService = inject(CartService);
  private toastService: ToastService = inject(ToastService);

  // Reactive signals for state management
  product = signal<Iproduct | undefined>(undefined);
  isLoading = signal(true);
  error = signal<string | null>(null);
  selectedImageIndex = signal(0);
  quantity = signal(1);
  isInWishlistSignal = signal<boolean>(false);
  wishlistStatusLoaded = signal<boolean>(false);
  showWishlistDropdown = signal<boolean>(false);
  isAddingToCart = signal<boolean>(false); // New signal for cart loading state

  // Selection state for options (will be populated from API data)
  selectedFabricIndex = signal<number>(0);
  selectedWoodIndex = signal<number>(0);
  selectedColorIndex = signal<number>(0);

  // Computed values
  selectedImage = computed(() => {
    const prod = this.product();
    const index = this.selectedImageIndex();
    return prod?.images && prod.images[index] ? prod.images[index] : '';
  });

  totalPrice = computed(() => {
    const prod = this.product();
    const qty = this.quantity();
    return prod ? prod.price! * qty : 0;
  });

  deliveryDateRange = computed(() => {
    const prod = this.product();
    if (!prod?.madeToOrder || !prod.deliveryMinDays || !prod.deliveryMaxDays) {
      return null;
    }
    
    const today = new Date();
    const minDate = new Date(today.getTime() + (prod.deliveryMinDays * 24 * 60 * 60 * 1000));
    const maxDate = new Date(today.getTime() + (prod.deliveryMaxDays * 24 * 60 * 60 * 1000));
    
    return {
      min: minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      max: maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  });

  // Dynamic computed values for selected options
  selectedFabric = computed(() => {
    const prod = this.product();
    const index = this.selectedFabricIndex();
    return prod?.fabrics && prod.fabrics[index] ? prod.fabrics[index] : null;
  });

  selectedWood = computed(() => {
    const prod = this.product();
    const index = this.selectedWoodIndex();
    return prod?.woods && prod.woods[index] ? prod.woods[index] : null;
  });

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        const slug = params.get('slug');
        
        this.isLoading.set(true);
        this.error.set(null);
        this.product.set(undefined);
        this.isInWishlistSignal.set(false);
        this.wishlistStatusLoaded.set(false);
        if (id) {
          return this.productService.getById(Number(id));
        } else if (slug) {
          return this.productService.getBySlug(slug);
        } else {
          this.error.set('Invalid product identifier');
          return of(undefined);
        }
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (product) => {
        if (product) {
          this.product.set(product);
          this.selectedImageIndex.set(0);
          this.selectedFabricIndex.set(0);
          this.selectedWoodIndex.set(0);
          this.selectedColorIndex.set(0);
          this.quantity.set(1);
          this.loadWishlistStatus(product.productId);
        } else {
          this.error.set('Product not found');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load product');
        this.isLoading.set(false);
        console.error('Error loading product:', err);
      }
    });
  }

  private loadWishlistStatus(productId: number) {
    if (this.wishlistStatusLoaded()) return;
    
    this.wishlistService.getWishlistsDropdown(productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            const isInWishlist = response.data.some(w => w.isInWishlist);
            this.isInWishlistSignal.set(isInWishlist);
          } else {
            this.isInWishlistSignal.set(false);
          }
          this.wishlistStatusLoaded.set(true);
        },
        error: (error) => {
          console.error('Error loading wishlist status:', error);
          this.wishlistStatusLoaded.set(true);
        }
      });
  }

  onWishlistChanged(event: {productId: number, inWishlist: boolean}): void {
    const currentProduct = this.product();
    if (currentProduct && currentProduct.productId === event.productId) {
      this.product.update(prod => 
        prod ? { ...prod, isWishlisted: event.inWishlist } : prod
      );
    }
  }

  // Image navigation methods
  selectImage(index: number) {
    const prod = this.product();
    if (prod?.images && index >= 0 && index < prod.images.length) {
      this.selectedImageIndex.set(index);
    }
  }

  isInWishlist(): boolean {
    return this.isInWishlistSignal();
  }

  shouldShowHeartButton = computed(() => {
    return this.product()?.productId && this.wishlistStatusLoaded();
  });

  onWishlistToggled(event: {productId: number, added: boolean}): void {
    const currentProduct = this.product();
    if (currentProduct && currentProduct.productId === event.productId) {
      this.isInWishlistSignal.set(event.added);
      this.product.update(prod => 
        prod ? { ...prod, isWishlisted: event.added } : prod
      );
    }
  }

  nextImage(): void {
    const prod = this.product();
    if (!prod?.images || prod.images.length <= 1) return;
    
    const currentIndex = this.selectedImageIndex();
    const newIndex = currentIndex < prod.images.length - 1 ? currentIndex + 1 : 0;
    this.selectImage(newIndex);
  }

  previousImage(): void {
    const prod = this.product();
    if (!prod?.images || prod.images.length <= 1) return;
    
    const currentIndex = this.selectedImageIndex();
    const newIndex = currentIndex > 0 ? currentIndex - 1 : prod.images.length - 1;
    this.selectImage(newIndex);
  }

  // Keyboard navigation for images
  onImageKeydown(event: KeyboardEvent): void {
    const prod = this.product();
    if (!prod?.images || prod.images.length <= 1) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.previousImage();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextImage();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.previousImage();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.nextImage();
        break;
    }
  }

  // Quantity management
  increaseQuantity() {
    this.quantity.update(qty => qty + 1);
  }

  decreaseQuantity() {
    this.quantity.update(qty => Math.max(1, qty - 1));
  }

  setQuantity(value: number) {
    if (value >= 1) {
      this.quantity.set(value);
    }
  }

  // Selection methods for options
  selectFabric(index: number) {
    const prod = this.product();
    if (prod?.fabrics && index >= 0 && index < prod.fabrics.length) {
      this.selectedFabricIndex.set(index);
    }
  }

  selectWood(index: number) {
    const prod = this.product();
    if (prod?.woods && index >= 0 && index < prod.woods.length) {
      this.selectedWoodIndex.set(index);
    }
  }

  selectColor(index: number) {
    this.selectFabric(index);
  }

  // Add to cart method
  addToCart() {
    const product = this.product();
    if (!product) return;
    
    this.isAddingToCart.set(true);
    
    const request: AddToCartRequestDto = {
      productItemId: product.productItemId, // Assuming productId is the correct identifier
      quantity: this.quantity()
    };
    
    this.cartService.addToCart(request).subscribe({
      next: (response) => {
        this.isAddingToCart.set(false);
        if (response.succeeded) {
          this.cartService.refreshCartCount();
          this.toastService.showSuccess(response.message || 'Product added to cart', 'Cart Updated');
        } else {
          this.toastService.showError(response.message || 'Failed to add product to cart', 'Cart Error');
        }
      },
      error: (error) => {
        this.isAddingToCart.set(false);
        this.toastService.showError('Failed to add product to cart', 'Cart Error');
      }
    });
  }

  buyNow() {
    const product = this.product();
    if (!product) return;
    
    // First add to cart, then navigate to checkout
    this.isAddingToCart.set(true);
    
    const request: AddToCartRequestDto = {
      productItemId: product.productId,
      quantity: this.quantity()
    };
    
    this.cartService.addToCart(request).subscribe({
      next: (response) => {
        this.isAddingToCart.set(false);
        if (response.succeeded) {
          this.cartService.refreshCartCount();
          this.router.navigate(['/checkout']);
        } else {
          this.toastService.showError(response.message || 'Failed to add product to cart', 'Cart Error');
        }
      },
      error: (error) => {
        this.isAddingToCart.set(false);
        this.toastService.showError('Failed to add product to cart', 'Cart Error');
      }
    });
  }

  addToWishlist() {
    const prod = this.product();
    if (prod) {
      const newWishlistStatus = !prod.isWishlisted;
      this.product.update(currentProduct => {
        if (currentProduct) {
          return { ...currentProduct, isWishlisted: newWishlistStatus };
        }
        return currentProduct;
      });
    }
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  hasSpecifications(): boolean {
    const prod = this.product();
    if (!prod) return false;
    
    return !!(
      (prod.productSpecification && prod.productSpecification.length > 0) ||
      prod.dimensionsOrSize ||
      prod.brand ||
      prod.sku
    );
  }

  onHeartButtonClick(event: Event): void {
    event.stopPropagation();
    const isCurrentlyVisible = this.showWishlistDropdown();
    this.showWishlistDropdown.set(!isCurrentlyVisible);
    
    if (!isCurrentlyVisible && this.product()?.productId) {
      this.loadWishlistData();
    }
  }

  private loadWishlistData(): void {
    const productId = this.product()?.productId;
    if (!productId) return;
    console.log('Loading wishlist data for product:', productId);
  }

  onDropdownClose(): void {
    this.showWishlistDropdown.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.showWishlistDropdown()) {
      const target = event.target as HTMLElement;
      const heartContainer = target.closest('.heart-button-container');
      const dropdown = target.closest('.wishlist-dropdown');
      
      if (!heartContainer && !dropdown) {
        this.showWishlistDropdown.set(false);
      }
    }
  }
}