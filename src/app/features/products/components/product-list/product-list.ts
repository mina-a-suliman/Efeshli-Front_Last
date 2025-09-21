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


  brands: any[] = [];
  loadingBrands = false;
  currentCategoryForBrands: number | null = null;

   fabricColors: any[] = [];
  loadingFabricColors = false;
  currentCategoryForFabricColors: number | null = null;
  woodColors: any[] = [];
  loadingWoodColors = false;
  currentCategoryForWoodColors: number | null = null;

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
// في product-list.ts - تحديث ngOnInit
ngOnInit(): void {
  this.loadCategories();
  
  // this.route.queryParams.subscribe(params => {
  //   console.log('📋 Query params received:', params);
    
  //   // إعادة تعيين الفلاتر
  //   this.resetFilters();
    
  //   // ✅ تحقق من collection أولاً
  //   if (params['collection']) {
  //     const collection = params['collection'];
  //     console.log('🎯 Loading collection:', collection);
  //     this.loadCollectionProducts(collection, params);
  //     return; // أوقف باقي المعالجة
  //   }
    
  //   // ✅ تحقق من keyword ثانياً
  //   if (params['keyword'] && params['keyword'].trim().length > 0) {
  //     const keyword = params['keyword'].trim();
  //     console.log('🔍 Search keyword found:', keyword);
      
  //     this.filters.keyword = keyword;
  //     this.currentSearchTerm = keyword;
      
  //     this.loadProducts(1);
  //     console.log('⚡ Search mode - skipping other filters');
  //     return;
  //   }
    
  //   // باقي الكود للفلاتر العادية...
  //   let categoryId: number | null = null;
    
  //   if (params['categoryId']) {
  //     categoryId = parseInt(params['categoryId'], 10);
  //     console.log('🎯 Found categoryId:', categoryId);
  //   } else if (params['category']) {
  //     categoryId = parseInt(params['category'], 10);
  //     console.log('🎯 Found category (converted to categoryId):', categoryId);
  //   }
    
  //   if (params['brandIds']) {
  //     const brandIds = Array.isArray(params['brandIds']) 
  //       ? params['brandIds'].map(id => parseInt(id, 10))
  //       : [parseInt(params['brandIds'], 10)];
      
  //     this.filters.selectedBrandIds = brandIds;
  //     console.log('🏷️ Selected brand IDs:', brandIds);
  //   }
    
  //   if (categoryId) {
  //     console.log('🎯 Setting categoryId filter:', categoryId);
      
  //     this.filters.selectedCategoryId = categoryId;
  //     this.filters.selectedSubcategoryId = null;
      
  //     this.loadBrands(categoryId);
  //     this.loadFabricColors(categoryId);
  //     this.loadWoodColors(categoryId);
      
  //     this.loadProducts(1);
  //   } else {
  //     console.log('📄 Loading all products');
      
  //     this.loadBrands();
  //     this.loadFabricColors();
  //     this.loadWoodColors();
  //     this.loadProducts(1);
  //   }
  // });

  this.route.queryParams.subscribe(params => {
    const keyword = params['keyword'];

    if (keyword && keyword.trim() !== '') {
      // ✅ في حالة فيه بحث
      this.loadProductsSer(keyword);
    } else {
      // ✅ في حالة مفيش بحث
      this.loadAllProducts();
    }
  });

}



loadProductsSer(keyword: string) {
  this.filterService.getCollectionProducts(keyword).subscribe({
    next: (data) => {
      this.products = data.items || []; 
    },
    error: (err) => console.error('Error loading collection products:', err)
  });
}

loadAllProducts() {
  this.filterService.getAllProducts().subscribe({
    next: (data) => {
      this.products = data.items || []; 
    },
    error: (err) => console.error('Error loading all products:', err)
  });
}



// تحديث resetFilters
private resetFilters(): void {
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
  this.currentSearchTerm = '';
  this.currentCollectionName = ''; // إضافة هذا السطر
}
// إضافة خاصية لحفظ مصطلح البحث الحالي
currentSearchTerm: string = '';

// دالة لإعادة تعيين الفلاتر

  ngOnDestroy(): void {
    if (this.routeParamsSubscription) {
      this.routeParamsSubscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
// في product-list.ts - أضف method للـ collections

loadCollectionProducts(collectionName: string, params: any): void {
  console.log('🎯 Loading collection products for:', collectionName);
  
  this.loading = true;
  this.error = null;
  this.currentCollectionName = collectionName; // لحفظ اسم المجموعة
  
  const pageNumber = params['pageNumber'] ? parseInt(params['pageNumber'], 10) : 1;
  const pageSize = params['pageSize'] ? parseInt(params['pageSize'], 10) : 24;
  
  this.filterService.getCollectionProducts(collectionName, pageNumber, pageSize)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading = false)
    )
    .subscribe({
      next: (data: ProductsData) => {
        console.log('✅ Collection products loaded successfully:', data);
        console.log('📊 Collection products count:', data.items?.length);
        console.log('📋 Total count from API:', data.totalCount);
        
        this.products = data.items;
        this.currentPage = data.pageNumber;
        this.totalPages = data.totalPages;
        this.totalCount = data.totalCount;
        this.hasNextPage = data.hasNextPage;
        this.hasPreviousPage = data.hasPreviousPage;
        
        console.log(`🎯 Collection "${collectionName}": ${data.totalCount} products found`);
      },
      error: (error) => {
        console.error('❌ Error loading collection products:', error);
        this.error = `Failed to load collection "${collectionName}". Please try again.`;
        this.products = [];
      }
    });
}

// إضافة خاصية لحفظ اسم المجموعة الحالية
currentCollectionName: string = '';
  loadProducts(page: number = 1): void {
  console.log('🔍 loadProducts called with page:', page);
  console.log('🎛️ Current filters state:', this.filters);

  this.loading = true;
  this.error = null;

  const filterRequest: any = {
    pageNumber: page,
    pageSize: this.pageSize,
    sortBy: this.selectedSort
  };

  // ✅ Condition للـ Keyword Search
  if (this.filters.keyword && this.filters.keyword.trim().length > 0) {
    filterRequest.keyword = this.filters.keyword.trim();
    console.log('✅ Added keyword to request:', this.filters.keyword);
  }

  // ✅ Condition للـ Category ID
  const categoryId = this.filters.selectedSubcategoryId || this.filters.selectedCategoryId;
  if (categoryId && categoryId > 0) {
    filterRequest.categoryId = categoryId;
    console.log('✅ Added categoryId to request:', categoryId);
  }

  // ✅ باقي الفلاتر...
  if (this.filters.selectedBrandIds && this.filters.selectedBrandIds.length > 0) {
    filterRequest.brandIds = this.filters.selectedBrandIds;
    console.log('✅ Added brandIds to request:', this.filters.selectedBrandIds);
  }

  if (this.filters.selectedFabricColorId && this.filters.selectedFabricColorId > 0) {
    filterRequest.fabricColorId = this.filters.selectedFabricColorId;
    console.log('✅ Added fabricColorId to request:', this.filters.selectedFabricColorId);
  }

  if (this.filters.selectedWoodColorId && this.filters.selectedWoodColorId > 0) {
    filterRequest.woodColorId = this.filters.selectedWoodColorId;
    console.log('✅ Added woodColorId to request:', this.filters.selectedWoodColorId);
  }

  if (this.filters.minPrice !== null && this.filters.minPrice !== undefined && this.filters.minPrice > 0) {
    filterRequest.minPrice = this.filters.minPrice;
    console.log('✅ Added minPrice to request:', this.filters.minPrice);
  }

  if (this.filters.maxPrice !== null && this.filters.maxPrice !== undefined && this.filters.maxPrice > 0) {
    filterRequest.maxPrice = this.filters.maxPrice;
    console.log('✅ Added maxPrice to request:', this.filters.maxPrice);
  }

  console.log('🌐 Final filterRequest object:', filterRequest);

  this.filterService.getFilteredProducts(filterRequest)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading = false)
    )
    .subscribe({
      next: (data: ProductsData) => {
        console.log('✅ Products loaded successfully:', data);
        console.log('📊 Products count:', data.items?.length);
        console.log('📋 Total count from API:', data.totalCount);
        
        this.products = data.items;
        this.currentPage = data.pageNumber;
        this.totalPages = data.totalPages;
        this.totalCount = data.totalCount;
        this.hasNextPage = data.hasNextPage;
        this.hasPreviousPage = data.hasPreviousPage;
        
        // إظهار معلومات البحث
        if (this.filters.keyword) {
          console.log(`🔍 Search results for "${this.filters.keyword}": ${data.totalCount} products found`);
        }
      },
      error: (error) => {
        console.error('❌ Error loading products:', error);
        this.error = 'Failed to load products. Please try again.';
        this.products = [];
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
  
  // إعادة تعيين الفلاتر المختارة عند تغيير الفئة
  this.filters.selectedBrandIds = [];
  this.filters.selectedFabricColorId = null;
  this.filters.selectedWoodColorId = null;
  
  // تحميل البراندات والألوان للفئة الجديدة
  this.loadBrands(categoryId);
  this.loadFabricColors(categoryId);
  this.loadWoodColors(categoryId);
    this.applyFilters();
  }
trackByFabricColor(index: number, color: any): number {
  return color.id || color.colorId;
}
  selectSubcategory(subcategoryId: number): void {
    this.filters.selectedSubcategoryId = subcategoryId;
    this.filters.selectedCategoryId = null; // Clear main category when subcategory is selected
    this.filters.selectedBrandIds = [];
    this.filters.selectedFabricColorId = null;
  this.filters.selectedWoodColorId = null;
    this.loadBrands(subcategoryId);
    this.loadFabricColors(subcategoryId);
    this.loadWoodColors(subcategoryId);
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
    this.currentSearchTerm = '';
  this.filters.keyword = '';
  
  // التنقل إلى صفحة المنتجات بدون بحث
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
      this.loadBrands();
  this.loadFabricColors();
this.loadWoodColors(); 
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
// في product-list.ts - أضف هذه الدالة

loadBrands(categoryId?: number): void {
  console.log('🔍 Loading brands for categoryId:', categoryId);
  
  this.loadingBrands = true;
  this.currentCategoryForBrands = categoryId || null;
  
  this.filterService.getBrands(categoryId)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loadingBrands = false)
    )
    .subscribe({
      next: (brands) => {
        console.log('✅ Brands loaded:', brands);
        this.brands = brands.map(brand => ({
          id: brand.id,
          name: brand.name,
          count: brand.count
        }));
        
        console.log('📊 Processed brands:', this.brands);
      },
      error: (error) => {
        console.error('❌ Error loading brands:', error);
        this.brands = [];
      }
    });
}

// في product-list.ts - أضف هذه الدالة

loadFabricColors(categoryId?: number): void {
  console.log('🔍 Loading fabric colors for categoryId:', categoryId);
  
  this.loadingFabricColors = true;
  this.currentCategoryForFabricColors = categoryId || null;
  
  this.filterService.getFabricColors(categoryId)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loadingFabricColors = false)
    )
    .subscribe({
      next: (colors) => {
        console.log('✅ Fabric colors loaded:', colors);
        this.fabricColors = colors.map(color => ({
          id: color.colorId,
          colorId: color.colorId,
          imageUrl: color.imageUrl,
          // You can add more properties if needed
          name: `Color ${color.colorId}` // Default name if not provided by API
        }));
        
        console.log('📊 Processed fabric colors:', this.fabricColors);
      },
      error: (error) => {
        console.error('❌ Error loading fabric colors:', error);
        this.fabricColors = [];
      }
    });
}

// في product-list.ts - أضف هذه الدالة بعد loadFabricColors

loadWoodColors(categoryId?: number): void {
  console.log('🔍 Loading wood colors for categoryId:', categoryId);
  
  this.loadingWoodColors = true;
  this.currentCategoryForWoodColors = categoryId || null;
  
  this.filterService.getWoodColors(categoryId)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loadingWoodColors = false)
    )
    .subscribe({
      next: (colors) => {
        console.log('✅ Wood colors loaded:', colors);
        this.woodColors = colors.map(color => ({
          id: color.colorId,
          colorId: color.colorId,
          imageUrl: color.imageUrl,
          name: `Wood Color ${color.colorId}` // Default name if not provided by API
        }));
        
        console.log('📊 Processed wood colors:', this.woodColors);
      },
      error: (error) => {
        console.error('❌ Error loading wood colors:', error);
        this.woodColors = [];
      }
    });
}
trackByWoodColor(index: number, color: any): number {
  return color.id || color.colorId;
}










  handleAddToCart(product: Product): void {
    console.log('Adding to cart:', product);
    // Implement add to cart logic
  }
  
}