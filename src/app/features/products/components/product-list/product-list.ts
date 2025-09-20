import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  size: string;
  imageUrl: string;
  isInWishlist?: boolean;
}

interface FilterOption {
  id: string;
  name: string;
  selected: boolean;
  count?: number;
  hex?: string;
}

interface RoomCategory {
  id: string;
  name: string;
  count?: number;
  expanded: boolean;
  hasSubcategories: boolean;
  subcategories?: FilterOption[];
}

interface Wishlist {
  name: string;
  products: Product[];
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductListComponent implements OnInit {
  filters = {
    deliveryOpen: true,
    roomOpen: true,
    decorOpen: true,
    brandOpen: true,
    priceOpen: true,
    colorOpen: true,
    fastDelivery: false,
    minPrice: 0,
    maxPrice: 100000
  };

  sortOption = 'recommended';
  
  roomCategories: RoomCategory[] = [
    {
      id: 'living-room',
      name: 'Living Room',
      count: 1050,
      expanded: true,
      hasSubcategories: true,
      subcategories: [
        { id: 'accent-chairs', name: 'Accent & Arm Chairs', selected: false, count: 215 },
        { id: 'sofas', name: 'Sofas & Sectionals', selected: false, count: 322 },
        { id: 'coffee-tables', name: 'Coffee Tables', selected: false, count: 328 },
        { id: 'side-tables', name: 'End & Side Tables', selected: false, count: 310 },
        { id: 'poufs', name: 'Poufs & Stools', selected: false, count: 121 },
        { id: 'consoles', name: 'Consoles & Back Sofas', selected: false, count: 101 },
        { id: 'media-consoles', name: 'Media Consoles & TV Units', selected: false, count: 105 },
        { id: 'storage', name: 'Storage Solutions', selected: false, count: 70 },
        { id: 'ottomans', name: 'Ottomans & Benches', selected: false, count: 72 },
        { id: 'sofa-beds', name: 'Sofa Beds & Daybeds', selected: false, count: 27 },
        { id: 'chaise', name: 'Chaise Lounges', selected: false, count: 15 },
        { id: 'tv-stands', name: 'TV Stands', selected: false, count: 45 },
        { id: 'bookshelves', name: 'Bookshelves', selected: false, count: 30 },
        { id: 'recliners', name: 'Recliners', selected: false, count: 20 }
      ]
    },
    {
      id: 'dining-room',
      name: 'Dining Room',
      count: 409,
      expanded: false,
      hasSubcategories: false
    },
    {
      id: 'bedroom',
      name: 'Bedroom',
      count: 207,
      expanded: false,
      hasSubcategories: false
    },
    {
      id: 'home-office',
      name: 'Home Office',
      count: 120,
      expanded: false,
      hasSubcategories: false
    },
    {
      id: 'outdoor',
      name: 'Outdoor',
      count: 56,
      expanded: false,
      hasSubcategories: false
    },
    {
      id: 'lighting',
      name: 'Lighting',
      expanded: false,
      hasSubcategories: true,
      subcategories: [
        { id: 'side-lamps', name: 'Side Lamps', selected: false, count: 9 },
        { id: 'floor-lamps', name: 'Floor Lamps', selected: false, count: 9 }
      ]
    },
    {
      id: 'rugs',
      name: 'Rugs',
      expanded: false,
      hasSubcategories: false
    },
    {
      id: 'bedding',
      name: 'Bedding & Bath',
      expanded: false,
      hasSubcategories: false
    },
    {
      id: 'decor',
      name: 'Decor',
      expanded: false,
      hasSubcategories: false
    },
    {
      id: 'kitchen',
      name: 'Kitchen & Dining',
      expanded: false,
      hasSubcategories: false
    },
    {
      id: 'appliances',
      name: 'Appliances',
      expanded: false,
      hasSubcategories: false
    },
    {
      id: 'kids',
      name: 'Kids Furniture',
      expanded: false,
      hasSubcategories: false
    },
    {
      id: 'mirrors',
      name: 'Mirrors',
      expanded: false,
      hasSubcategories: false
    }
  ];

  decorFilters: FilterOption[] = [
    { id: 'cushions', name: 'Cushions & Throws', selected: false },
    { id: 'plants', name: 'Plants & Pots', selected: false },
    { id: 'curtains', name: 'Curtains & Curtains Accessories', selected: false },
    { id: 'decor-accessories', name: 'Decorative Accessories', selected: false },
    { id: 'wall-art', name: 'Wall Art', selected: false },
    { id: 'storage-org', name: 'Storage & Organization', selected: false }
  ];

  brandFilters: FilterOption[] = [
    { id: 'amsol', name: 'AmSol showroom', selected: false },
    { id: 'anilica', name: 'Anilica', selected: false },
    { id: 'bes', name: 'B.E.S Lighting', selected: false },
    { id: 'boho', name: 'Boho Woodland', selected: false },
    { id: 'by-homy', name: 'By Homy', selected: false },
    { id: 'essentials', name: 'Essentials', selected: false, count: 22 },
    { id: 'gezazy', name: 'Gezazy', selected: false, count: 1 },
    { id: 'handpick', name: 'Handpick', selected: false, count: 1 },
    { id: 'inca', name: 'INCA', selected: false, count: 16 },
    { id: 'jam', name: 'Jam by Hedayat', selected: false, count: 43 },
    { id: 'jera', name: 'Jera', selected: false, count: 1 },
    { id: 'kelos', name: 'Kelos', selected: false, count: 61 },
    { id: 'khoos', name: 'Khoos', selected: false, count: 4 },
    { id: 'le-prince', name: 'Le Prince', selected: false, count: 51 },
    { id: 'leon', name: 'Leon', selected: false, count: 9 },
    { id: 'melange', name: 'Melange', selected: false, count: 1 },
    { id: 'natura', name: 'Natura', selected: false, count: 15 },
    { id: 'nina', name: 'Nina June', selected: false, count: 2 },
    { id: 'osha', name: 'Osha Home', selected: false, count: 2 },
    { id: 'roomno9', name: 'Room No9', selected: false, count: 13 },
    { id: 'sal', name: 'SAL', selected: false, count: 37 },
    { id: 'shell', name: 'Shell Homage', selected: false, count: 1 },
    { id: 'shosha', name: 'Shosha Kamal', selected: false, count: 3 },
    { id: 'snug', name: 'Snug', selected: false, count: 6 },
    { id: 'spazio', name: 'Spazio', selected: false, count: 2 },
    { id: 'tbs', name: 'TBS Home Lamp', selected: false, count: 253 },
    { id: 'tayets', name: 'Tayets', selected: false, count: 4 },
    { id: 'picnic', name: 'The Picnic Table Factory', selected: false, count: 1 },
    { id: 'ultra', name: 'Ultra Design', selected: false, count: 29 },
    { id: 'vetro', name: 'Vetro Mano', selected: false, count: 1 },
    { id: 'zulu', name: 'Zulu', selected: false, count: 21 },
    { id: 'ylights', name: 'y lights', selected: false, count: 188 }
  ];

  colorFilters: FilterOption[] = [
    { id: 'color-1', name: 'Dark Brown', selected: false, count: 1, hex: '#8B4513' },
    { id: 'color-2', name: 'Tan', selected: false, count: 1, hex: '#D2B48C' },
    { id: 'color-3', name: 'Wheat', selected: false, count: 6, hex: '#F5DEB3' },
    { id: 'color-4', name: 'Sienna', selected: false, count: 1, hex: '#A0522D' },
    { id: 'color-5', name: 'Burly Wood', selected: false, count: 2, hex: '#DEB887' }
  ];

  products: Product[] = [
    { id: 1, name: 'Glow Table Lamp', price: 369, discount: 10, category: 'Side Lamps', size: 'Size: 20', imageUrl: 'https://dkq2tfmdsh9ss.cloudfront.net/filters:background_color(fff)/fit-in/260x274/filters:format(jpeg)/products/VVuV8EkFe8byxiXYU8rCS9SWu2BoSxPrMRTxLJqJ.webp', isInWishlist: false },
    { id: 2, name: 'Table Lamp NCA62', price: 485, category: 'Side Lamps', size: 'Size: 30*12', imageUrl: 'https://dkq2tfmdsh9ss.cloudfront.net/filters:background_color(fff)/fit-in/260x274/filters:format(jpeg)/products/vPYQis0FDGFOBAz8aMEVHUok9R3oBcVoCkRdvtu0.jpg', isInWishlist: false },
    { id: 3, name: 'Table Lamp - Gold & Beige YLMMP31', price: 590, originalPrice: 695, discount: 15, category: 'Side Lamps', size: 'Size: Length (cm) : 17 Width (cm)...', imageUrl: 'https://dkq2tfmdsh9ss.cloudfront.net/filters:background_color(fff)/fit-in/260x274/filters:format(jpeg)/products/5Np2ZIu7qydKtJNyyGqmRtOVF4ZacTC5LFfh1VPC.jpg', isInWishlist: false },
    { id: 4, name: 'Bross Luxe Lantern', price: 4000, originalPrice: 4880, category: 'Floor Lamps', size: 'Size: ---', imageUrl: 'https://dkq2tfmdsh9ss.cloudfront.net/filters:background_color(fff)/fit-in/260x274/filters:format(jpeg)/products/VVuV8EkFe8byxiXYU8rCS9SWu2BoSxPrMRTxLJqJ.webp', isInWishlist: false },
    { id: 5, name: 'Kato Floor Lamp Concrete', price: 5200, category: 'Floor Lamps', size: 'Size: H 50 and 40 cm', imageUrl: 'https://dkq2tfmdsh9ss.cloudfront.net/filters:background_color(fff)/fit-in/260x274/filters:format(jpeg)/products/vPYQis0FDGFOBAz8aMEVHUok9R3oBcVoCkRdvtu0.jpg', isInWishlist: false },
    { id: 6, name: 'Lucie Floor Lamp - YL-FL-730N-N', price: 8800, originalPrice: 12800, discount: 31, category: 'Floor Lamps', size: 'Size: D 32 x H 170 cm', imageUrl: 'https://dkq2tfmdsh9ss.cloudfront.net/filters:background_color(fff)/fit-in/260x274/filters:format(jpeg)/products/5Np2ZIu7qydKtJNyyGqmRtOVF4ZacTC5LFfh1VPC.jpg', isInWishlist: false },
    { id: 7, name: 'Modern Sofa Set', price: 2500, category: 'Sofas & Sectionals', size: 'Size: 200x90 cm', imageUrl: 'https://example.com/modern-sofa.jpg', isInWishlist: false },
    { id: 8, name: 'Wooden Coffee Table', price: 450, category: 'Coffee Tables', size: 'Size: 120x60 cm', imageUrl: 'https://example.com/wooden-coffee-table.jpg', isInWishlist: false },
    { id: 9, name: 'Side Table with Storage', price: 300, category: 'End & Side Tables', size: 'Size: 50x50 cm', imageUrl: 'https://example.com/side-table.jpg', isInWishlist: false },
    { id: 10, name: 'Ottoman Bench', price: 200, discount: 10, category: 'Ottomans & Benches', size: 'Size: 100x40 cm', imageUrl: 'https://example.com/ottoman-bench.jpg', isInWishlist: false },
    { id: 11, name: 'TV Stand with Shelves', price: 600, category: 'TV Stands', size: 'Size: 150x40 cm', imageUrl: 'https://example.com/tv-stand.jpg', isInWishlist: false },
    { id: 12, name: 'Oak Bookshelf', price: 350, category: 'Bookshelves', size: 'Size: 90x30 cm', imageUrl: 'https://example.com/oak-bookshelf.jpg', isInWishlist: false },
    { id: 13, name: 'Recliner Chair', price: 800, originalPrice: 950, discount: 15, category: 'Recliners', size: 'Size: 80x90 cm', imageUrl: 'https://example.com/recliner-chair.jpg', isInWishlist: false }
  ];

  filteredProducts: Product[] = [];
  myFavorites: Product[] = [];
  wishlistLists: Wishlist[] = [{ name: 'My Favorites', products: [] }];
  showWishlistDropdown: boolean = false;
  selectedProduct: Product | null = null;

  ngOnInit(): void {
    this.filteredProducts = [...this.products];
  }

  toggleFilterSection(section: string): void {
    switch (section) {
      case 'delivery':
        this.filters.deliveryOpen = !this.filters.deliveryOpen;
        break;
      case 'room':
        this.filters.roomOpen = !this.filters.roomOpen;
        break;
      case 'decor':
        this.filters.decorOpen = !this.filters.decorOpen;
        break;
      case 'brand':
        this.filters.brandOpen = !this.filters.brandOpen;
        break;
      case 'price':
        this.filters.priceOpen = !this.filters.priceOpen;
        break;
      case 'color':
        this.filters.colorOpen = !this.filters.colorOpen;
        break;
    }
    this.applyFilters();
  }

  toggleRoomCategory(category: RoomCategory): void {
    category.expanded = !category.expanded;
  }

  addToCart(product: Product): void {
    console.log('Added to cart:', product);
    alert(`${product.name} added to cart!`);
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      if (product.price < this.filters.minPrice || product.price > this.filters.maxPrice) {
        return false;
      }
      // if (this.filters.fastDelivery && !product.fastDelivery) {
      //   return false;
      // }
      const selectedSubcategories = this.roomCategories
        .filter(category => category.hasSubcategories)
        .flatMap(category => category.subcategories || [])
        .filter(subcategory => subcategory.selected);
      if (selectedSubcategories.length > 0) {
        const matchesCategory = selectedSubcategories.some(subcategory =>
          product.category === subcategory.name
        );
        if (!matchesCategory) return false;
      }
      const selectedDecor = this.decorFilters.filter(decor => decor.selected);
      if (selectedDecor.length > 0) {
        return false; 
      }
      const selectedBrands = this.brandFilters.filter(brand => brand.selected);
      if (selectedBrands.length > 0) {
        return false; 
      }
      const selectedColors = this.colorFilters.filter(color => color.selected);
      if (selectedColors.length > 0) {
        return false; 
      }
      return true;
    });
    this.sortProducts();
  }
  
  sortProducts(): void {
    switch (this.sortOption) {
      case 'priceLow':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'priceHigh':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        this.filteredProducts.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }
  }

  toggleWishlist(product: Product): void {
    this.selectedProduct = product;
    this.showWishlistDropdown = !this.showWishlistDropdown;
  }

  addToWishlist(listName: string): void {
    if (this.selectedProduct) {
      const wishlist = this.wishlistLists.find(w => w.name === listName);
      if (wishlist) {
        if (!this.selectedProduct.isInWishlist) {
          wishlist.products.push({ ...this.selectedProduct, isInWishlist: true });
          this.selectedProduct.isInWishlist = true;
          console.log(`${this.selectedProduct.name} added to ${listName}`);
          alert(`${this.selectedProduct.name} added to ${listName}!`);
        } else {
          alert(`${this.selectedProduct.name} is already in ${listName}!`);
        }
      }
      this.showWishlistDropdown = false;
      this.selectedProduct = null;
    }
  }

  createNewWishlist(newListName: string): void {
    if (newListName && !this.wishlistLists.some(w => w.name === newListName)) {
      this.wishlistLists.push({ name: newListName, products: [] });
      console.log(`New wishlist "${newListName}" created`);
    }
    this.showWishlistDropdown = false;
  }
}