import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { FilterService, Product, ProductsData ,Category} from '../../../../core/services/filter.service';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card';
import { ProductHeartButtonComponent } from '../../../../features/product-heart-button/product-heart-button';
import { WishlistDropdownComponent } from "../../../wishlist/wishlist-dropdown.component";
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, ProductHeartButtonComponent, WishlistDropdownComponent],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
    private routeParamsSubscription?: Subscription;

  private destroy$ = new Subject<void>();
  selectedProductForWishlist: Product | null = null;
  showWishlistDropdown = false;
  // Data properties
  products: Product[] = [];
  loading = false;
  error: string | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 24;
  totalPages = 0;
  totalCount = 0;
  hasNextPage = false;
  hasPreviousPage = false;

  // Sort options
  sortOptions = [
    { value: 'Recommended', label: 'Recommended' },
    { value: 'LatestProducts', label: 'Latest Products' },
    { value: 'PriceLowToHigh', label: 'Price: Low to High' },
    { value: 'PriceHighToLow', label: 'Price: High to Low' },
    { value: 'BestSelling', label: 'Best Selling' }
  ];
  
  selectedSort = 'Recommended';
  categories: Category[] = [];
  subcategories: { [key: number]: Category[] } = {};
  loadingCategories = false;
  loadingSubcategories: { [key: number]: boolean } = {};


  brands = [
    { id: 1, name: 'IKEA', count: 45 },
    { id: 2, name: 'West Elm', count: 32 },
    { id: 3, name: 'CB2', count: 28 },
    { id: 4, name: 'Pottery Barn', count: 51 },
    { id: 5, name: 'Article', count: 23 },
    { id: 6, name: 'Wayfair', count: 67 }
  ];

  fabricColors = [
    { id: 1, name: 'Beige', hexCode: '#F5F5DC' },
    { id: 2, name: 'Grey', hexCode: '#808080' },
    { id: 3, name: 'Navy Blue', hexCode: '#000080' },
    { id: 4, name: 'Cream', hexCode: '#FFFDD0' },
    { id: 5, name: 'Black', hexCode: '#000000' },
    { id: 6, name: 'White', hexCode: '#FFFFFF' }
  ];

  woodColors = [
    { id: 1, name: 'Oak', hexCode: '#D2691E' },
    { id: 2, name: 'Walnut', hexCode: '#8B4513' },
    { id: 3, name: 'Pine', hexCode: '#DEB887' },
    { id: 4, name: 'Cherry', hexCode: '#A0522D' },
    { id: 5, name: 'Mahogany', hexCode: '#C04000' }
  ];

  // Filter State
  filters = {
    selectedCategoryId: null as number | null,
    selectedSubcategoryId: null as number | null,
    selectedBrandIds: [] as number[],
    selectedFabricColorId: null as number | null,
    selectedWoodColorId: null as number | null,
    minPrice: null as number | null,
    maxPrice: null as number | null,
    keyword: ''
  };

  // UI State
  filterSections = {
    categoryOpen: true,
    brandOpen: true,
    fabricColorOpen: true,
    woodColorOpen: true,
    priceOpen: true
  };
  // UI properties
  wishlistLists: any[] = [];
  selectedProduct: Product | null = null;

  constructor(private filterService: FilterService,private route: ActivatedRoute ) {}

 // في ngOnInit - استبدل الكود الحالي بده
ngOnInit(): void {
  this.loadCategories();
  
  this.route.queryParams.subscribe(params => {
    console.log('📋 Query params received:', params);
    
    // تحقق من categoryId أو category
    let categoryId: number | null = null;
    
    if (params['categoryId']) {
      categoryId = parseInt(params['categoryId'], 10);
      console.log('🎯 Found categoryId:', categoryId);
    } else if (params['category']) {
      categoryId = parseInt(params['category'], 10);
      console.log('🎯 Found category (converted to categoryId):', categoryId);
    }
    
    if (categoryId) {
      console.log('🎯 Setting categoryId filter:', categoryId);
      
      // تطبيق فلتر الفئة
      this.filters.selectedCategoryId = categoryId;
      this.filters.selectedSubcategoryId = null;
      
      // تحميل المنتجات فوراً مع الفلتر
      this.loadProducts(1);
    } else {
      console.log('📄 No categoryId/category in params, loading all products');
      // تحميل كل المنتجات إذا مفيش فلتر
      this.loadProducts(1);
    }
  });
}

  ngOnDestroy(): void {
    if (this.routeParamsSubscription) {
      this.routeParamsSubscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(page: number = 1): void {
      console.log('🎛️ Current filters state:', this.filters);

    this.loading = true;
    this.error = null;
  const categoryId = this.filters.selectedSubcategoryId || this.filters.selectedCategoryId;

    // Create filter request with minimal parameters
    const filterRequest: any = {
    pageNumber: page,
    pageSize: this.pageSize,
    sortBy: this.selectedSort
  };
  if (categoryId) {
    filterRequest.categoryId = categoryId;
  }
 if (this.filters.selectedBrandIds && this.filters.selectedBrandIds.length > 0) {
    filterRequest.brandIds = this.filters.selectedBrandIds;
  }

  if (this.filters.selectedFabricColorId) {
    filterRequest.fabricColorId = this.filters.selectedFabricColorId;
  }

  if (this.filters.selectedWoodColorId) {
    filterRequest.woodColorId = this.filters.selectedWoodColorId;
  }

  if (this.filters.minPrice !== null && this.filters.minPrice !== undefined) {
    filterRequest.minPrice = this.filters.minPrice;
  }

  if (this.filters.maxPrice !== null && this.filters.maxPrice !== undefined) {
    filterRequest.maxPrice = this.filters.maxPrice;
  }

  if (this.filters.keyword) {
    filterRequest.keyword = this.filters.keyword;
  }
  // إضافة باقي الفلاتر إذا كانت موجودة
  if (this.filters.selectedBrandIds && this.filters.selectedBrandIds.length > 0) {
    filterRequest.brandIds = this.filters.selectedBrandIds;
  }

  if (this.filters.selectedFabricColorId) {
    filterRequest.fabricColorId = this.filters.selectedFabricColorId;
  }
// Cast filterRequest to any to allow string indexing

    this.filterService.getFilteredProducts(filterRequest)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (data: ProductsData) => {
          this.products = data.items;
          
          // Update pagination
          this.currentPage = data.pageNumber;
          this.totalPages = data.totalPages;
          this.totalCount = data.totalCount;
          this.hasNextPage = data.hasNextPage;
          this.hasPreviousPage = data.hasPreviousPage;
          
          console.log('Products loaded:', data);
        },
        error: (error) => {
          this.error = 'Failed to load products. Please try again.';
          console.error('Error loading products:', error);
        }
      });
  }
  loadCategories(): void {
    this.loadingCategories = true;
    
    this.filterService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
            console.log('Categories API response:', categories);

         this.categories = categories.map((cat: any) => ({
            categoryId: cat.categoryId ?? cat.id,              // من الـAPI اسمه id
            name: cat.name,                  // من الـAPI اسمه name
            hasSubCategories: cat.hasSubCategories, // اعتبر إن ليه Sub لو count > 0
            expanded: false
          }));
          this.loadingCategories = false;
          console.log('Categories loaded:', categories);
        },
        error: (error) => {
          console.error('Failed to load categories:', error);
          this.loadingCategories = false;
          // Fallback to empty array
          this.categories = [];
        }
      });
  }
   loadSubcategories(categoryId: number): void {
        this.loadingSubcategories[categoryId] = true; // ✅ قبل ما تنادي API
        this.subcategories[categoryId] = [];

        this.filterService.getSubCategories(categoryId).pipe(
          finalize(() => this.loadingSubcategories[categoryId] = false) // ✅ بعد ما تخلص
        ).subscribe({
          next: (subs) => {
            console.log('API subcategories response for', categoryId, subs);
            this.subcategories[categoryId] = subs.map((sub: any) => ({
              categoryId: sub.categoryId ?? sub.id, // من الـAPI اسمه id
              name: sub.name,
              hasSubCategories: sub.hasSubCategories,
              expanded: false
            }));
          },
          error: (err) => {
            console.error('Error loading subcategories:', err);
          }
        });
}

  isLoadingSubcategories(categoryId: number): boolean {
    return !!this.loadingSubcategories[categoryId];
  }
  getSubcategories(parentCategoryId: number): Category[] {
    return this.subcategories[parentCategoryId] || [];
  }
  toggleCategory(category: any): void {

  console.log('Toggle category - Full object:', category);
  console.log('hasSubCategories value:', category.hasSubCategories);
  console.log('categoryId value:', category.categoryId);
console.log('Testing hasSubCategories:', {
  original: category.hasSubCategories,
  type: typeof category.hasSubCategories,
  boolean: Boolean(category.hasSubCategories),
  strict_true: category.hasSubCategories === true
});
  // المشكلة هنا: لازم نتأكد إن hasSubCategories = true بوضوح
  if (category.hasSubCategories === true) {
    // لو فيه subcategories افتح/اقفل
    category.expanded = !category.expanded;
    console.log('Category expanded:', category.expanded);

    // لو اتفتح ومفيش subcategories متحملة قبل كده
    if (category.expanded && !this.subcategories[category.categoryId]) {
      console.log('Loading subcategories for categoryId:', category.categoryId);
      this.loadSubcategories(category.categoryId);
    }
  } else {
    // لو مفيش subcategories → اعتبرها كاتيجوري نهائية
    console.log('No subcategories, selecting category:', category.categoryId);
    this.selectCategory(category.categoryId);
    category.expanded = false; // اقفلها لو كانت مفتوحة
  }
}
 getCategoryId(category: Category): number | undefined {
    return category.categoryId || category.id;
  }
 toggleFilterSection(section: string): void {
    switch (section) {
      case 'category':
        this.filterSections.categoryOpen = !this.filterSections.categoryOpen;
        break;
      case 'brand':
        this.filterSections.brandOpen = !this.filterSections.brandOpen;
        break;
      case 'fabricColor':
        this.filterSections.fabricColorOpen = !this.filterSections.fabricColorOpen;
        break;
      case 'woodColor':
        this.filterSections.woodColorOpen = !this.filterSections.woodColorOpen;
        break;
      case 'price':
        this.filterSections.priceOpen = !this.filterSections.priceOpen;
        break;
    }
  }

  
  selectCategory(categoryId: number): void {
    this.filters.selectedCategoryId = categoryId;
    this.filters.selectedSubcategoryId = null;
    this.applyFilters();
  }

  selectSubcategory(subcategoryId: number): void {
    this.filters.selectedSubcategoryId = subcategoryId;
    this.filters.selectedCategoryId = null; // Clear main category when subcategory is selected
    this.applyFilters();
  }

  // Brand Methods
  toggleBrand(brandId: number): void {
    const index = this.filters.selectedBrandIds.indexOf(brandId);
    if (index > -1) {
      this.filters.selectedBrandIds.splice(index, 1);
    } else {
      this.filters.selectedBrandIds.push(brandId);
    }
    this.applyFilters();
  }

  isBrandSelected(brandId: number): boolean {
    return this.filters.selectedBrandIds.includes(brandId);
  }

  // Color Methods
  selectFabricColor(colorId: number): void {
    this.filters.selectedFabricColorId = 
      this.filters.selectedFabricColorId === colorId ? null : colorId;
    this.applyFilters();
  }

  selectWoodColor(colorId: number): void {
    this.filters.selectedWoodColorId = 
      this.filters.selectedWoodColorId === colorId ? null : colorId;
    this.applyFilters();
  }

  isFabricColorSelected(colorId: number): boolean {
    return this.filters.selectedFabricColorId === colorId;
  }

  isWoodColorSelected(colorId: number): boolean {

    if (!this.filters) {
    return false;
  }
    return this.filters.selectedWoodColorId === colorId;
  }

  // Price Methods
 


  // Search Methods
  onSearchChange(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.filters.keyword = '';
    this.applyFilters();
  }

  // Apply Filters
  applyFilters(): void {
    this.loadProducts(1); // Reset to first page when applying filters
  }

  // Clear All Filters
  clearAllFilters(): void {
    this.filters = {
      selectedCategoryId: null,
      selectedSubcategoryId: null,
      selectedBrandIds: [],
      selectedFabricColorId: null,
      selectedWoodColorId: null,
      minPrice: null,
      maxPrice: null,
      keyword: ''
    };

    // Reset category expansion
    this.categories.forEach(cat => cat.expanded = false);
    
    this.applyFilters();
  }

  // Sort change


  onSortChange(): void {
    this.loadProducts(1); // Reset to first page when sorting
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.loadProducts(page);
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const currentPage = this.currentPage;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Event handlers for product cards
  
  onProductHeartClick(product: Product, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    
    console.log('Heart clicked for product:', product.productId || product.id);
    
    this.selectedProductForWishlist = product;
    this.showWishlistDropdown = true;
  }

  onWishlistDropdownClose(): void {
    this.showWishlistDropdown = false;
    this.selectedProductForWishlist = null;
  }

  onWishlistItemAdded(event: { wishlistId: number, productId: number }): void {
    console.log('Item added to wishlist:', event);
    
    // Update the product's wishlist status
    const product = this.products.find(p => (p.productId || p.id) === event.productId);
    if (product) {
      product.isWishlisted = true;
      product.isInWishlist = true;
    }
    
    this.onWishlistDropdownClose();
  }

  onWishlistItemRemoved(event: { wishlistId: number, productId: number }): void {
    console.log('Item removed from wishlist:', event);
    
    // Update the product's wishlist status
    const product = this.products.find(p => (p.productId || p.id) === event.productId);
    if (product) {
      product.isWishlisted = false;
      product.isInWishlist = false;
    }
  }

  // Keep existing wishlist change handler
  onProductWishlistChanged(event: { productId: number; inWishlist: boolean }): void {
    const product = this.products.find(p => (p.productId || p.id) === event.productId);
    if (product) {
      product.isInWishlist = event.inWishlist;
      product.isWishlisted = event.inWishlist;
    }
  }

  handleAddToCart(product: Product): void {
    console.log('Adding to cart:', product);
    // Implement add to cart logic
  }
  
}