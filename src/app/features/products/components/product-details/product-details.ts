// Updated product-detail-page.component.ts

import { AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe, NgIf, NgFor, TitleCasePipe, KeyValuePipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal, computed, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, map, of } from 'rxjs';
import { ProductService } from '../../../../core/services/product.service';
import { Iproduct } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  templateUrl: './product-details.html',
  styleUrls: ['./product-details.css'],
  imports: [RouterLink, CurrencyPipe, DatePipe, KeyValuePipe, CommonModule, NgIf, NgFor],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private destroyRef = inject(DestroyRef);

  // Reactive signals for state management
  product = signal<Iproduct | undefined>(undefined);
  isLoading = signal(true);
  error = signal<string | null>(null);
  selectedImageIndex = signal(0);
  quantity = signal(1);

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
        
        if (id) {
          // Handle ID-based routing
          return this.productService.getById(Number(id));
        } else if (slug) {
          // Handle slug-based routing (if you want to support both)
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
          // Reset selections when new product loads
          this.selectedImageIndex.set(0);
          this.selectedFabricIndex.set(0);
          this.selectedWoodIndex.set(0);
          this.selectedColorIndex.set(0);
          this.quantity.set(1);
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

  // Image navigation methods
  selectImage(index: number) {
    const prod = this.product();
    if (prod?.images && index >= 0 && index < prod.images.length) {
      this.selectedImageIndex.set(index);
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

  // Selection methods for options - now using API data
  selectFabric(index: number) {
    const prod = this.product();
    if (prod?.fabrics && index >= 0 && index < prod.fabrics.length) {
      this.selectedFabricIndex.set(index);
      console.log('Selected fabric:', prod.fabrics[index].name);
    }
  }

  selectWood(index: number) {
    const prod = this.product();
    if (prod?.woods && index >= 0 && index < prod.woods.length) {
      this.selectedWoodIndex.set(index);
      console.log('Selected wood:', prod.woods[index].name);
    }
  }

  selectColor(index: number) {
    // For now, using fabric as color since API has fabrics
    this.selectFabric(index);
  }

  // Actions
  addToCart() {
    const prod = this.product();
    const qty = this.quantity();
    const fabric = this.selectedFabric();
    const wood = this.selectedWood();
    
    if (prod) {
      console.log('Adding to cart:', {
        productId: prod.productId,
        name: prod.name,
        quantity: qty,
        price: prod.mainFinalPrice,
        selectedFabric: fabric,
        selectedWood: wood
      });
      // TODO: Implement cart service call
    }
  }

  buyNow() {
    const prod = this.product();
    const qty = this.quantity();
    const fabric = this.selectedFabric();
    const wood = this.selectedWood();
    
    if (prod) {
      console.log('Buy now:', {
        productId: prod.productId,
        name: prod.name,
        quantity: qty,
        price: prod.mainFinalPrice,
        selectedFabric: fabric,
        selectedWood: wood
      });
      // TODO: Navigate to checkout or call checkout service
    }
  }

  addToWishlist() {
    const prod = this.product();
    if (prod) {
      // Toggle wishlist status
      const newWishlistStatus = !prod.isWishlisted;
      
      // Update the product signal with new wishlist status
      this.product.update(currentProduct => {
        if (currentProduct) {
          return { ...currentProduct, isWishlisted: newWishlistStatus };
        }
        return currentProduct;
      });

      if (newWishlistStatus) {
        console.log(`Added ${prod.name} to wishlist`);
        // TODO: Call API to add to wishlist
        // this.wishlistService.addToWishlist(prod.id)
      } else {
        console.log(`Removed ${prod.name} from wishlist`);
        // TODO: Call API to remove from wishlist
        // this.wishlistService.removeFromWishlist(prod.id)
      }
    }
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}