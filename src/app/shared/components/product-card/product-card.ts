// product-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 
import { ProductHeartButtonComponent } from '../../../features/product-heart-button/product-heart-button';
type HeartButtonEvent = { productId: number; added: boolean };
type WishlistToggleEvent = { productId: number; inWishlist: boolean };

interface ProductInfo {
  WishlistItemId?: number;
  wishlistId?: number;
  productId: number;
  name?: string | null;
  category?: string | null;
  description?: string | null;
  size?: string | null;
  discount?: number;
  price?: number;
  finalPrice?: number | null;
  imageUrl?: string | null;
  productItemColorsUrls?: string[];
  isWishlisted?: boolean;
}

interface Wishlist {
  name: string;
  products: ProductInfo[];
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductHeartButtonComponent],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.css']
})
export class ProductCardComponent {
  @Input() product!: ProductInfo;
  @Input() wishlistLists: Wishlist[] = [];
  @Input() showWishlistDropdown: boolean = false;
  @Input() addToCartText: string = 'Add to Cart';
  @Input() showQuickView: boolean = true;
  @Input() cardClass: string = '';
  @Input() wishlistStatusLoaded: boolean = true; 
  @Input() showHeartButton: boolean = true;

  @Output() toggleWishlist = new EventEmitter<ProductInfo>();
  @Output() addToCart = new EventEmitter<ProductInfo>();
  @Output() addToWishlistEvent = new EventEmitter<{product: ProductInfo, listName: string}>();
  @Output() createNewWishlistEvent = new EventEmitter<{product: ProductInfo, listName: string}>();
  @Output() wishlistChanged = new EventEmitter<WishlistToggleEvent>();
  @Output() wishlistToggled = new EventEmitter<WishlistToggleEvent>();

  onToggleWishlist(): void {
    this.toggleWishlist.emit(this.product);
  }
private emitToggleEvent(inWishlist: boolean): void {
  this.wishlistToggled.emit({
    productId: this.product.productId,
    inWishlist: inWishlist
  });
}
  onAddToCart(): void {
    this.addToCart.emit(this.product);
  }

  onAddToWishlist(listName: string): void {
    this.addToWishlistEvent.emit({product: this.product, listName});
  }

  onCreateNewWishlist(listName: string): void {
    if (listName.trim()) {
      this.createNewWishlistEvent.emit({product: this.product, listName: listName.trim()});
    }
  }

  onWishlistToggled(event: { productId: number; added: boolean }): void {
  // Transform the event to match expected interface
  const transformedEvent = {
    productId: event.productId,
    inWishlist: event.added  // Map 'added' to 'inWishlist'
  };
  
  // Update local product state
  this.product.isWishlisted = event.added;
  
  // Emit the transformed event
  this.wishlistChanged.emit(transformedEvent);
}

  onProductWishlistChanged(event: {productId: number, inWishlist: boolean}): void {
    console.log('Product list - wishlist changed:', event);
    
    // Update the product in your products array
    
    // const productIndex = this.filteredProducts.findIndex(p => p.id === event.productId);
    // if (productIndex !== -1) {
    //   this.filteredProducts[productIndex].isInWishlist = event.inWishlist;
    // }
    
    // // You can also update the original products array if needed
    // const originalIndex = this.products.findIndex(p => p.id === event.productId);
    // if (originalIndex !== -1) {
    //   this.products[originalIndex].isInWishlist = event.inWishlist;
    // }
  }
}