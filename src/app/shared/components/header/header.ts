import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { CategoryService, Category } from '../../../core/services/category.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  imports: [CommonModule, RouterModule]
})
export class HeaderComponent implements OnInit {
  activeMenu: string = '';
  private hideTimeout: any;
  currentUser: User | null = null;
  isAuthenticated: boolean = false;
  isLoaded = false;

  // البيانات الديناميكية
  mainCategories: Category[] = [];
  subCategories: { [key: string]: Category[] } = {};
  furnitureData: { [key: string]: Category[] } = {};

  // خريطة لربط أسماء الفئات بمعرفاتها
  private categoryNameToIdMap: { [key: string]: number } = {
    'living room': 512,
    'dining room': 537, 
    'bedroom': 524,
    'kids furniture': 546,
    'outdoor': 540,
    'kitchen & dining': 544,
    'home office': 518,
    'accent & arm chairs': 513,
    'end & side tables': 514,
    'pouf & stools': 515,
    'consoles & back sofas': 516,
    'media consoles & tv units': 517,
    'storage solutions': 518,
    'ottomans & benches': 519,
    'sofa beds & daybeds': 520,
    'chaise lounges': 521,
    'coffee tables': 522,
    'sofa & sectionals': 523
  };

  constructor(
    private router: Router,
    private authService: AuthService, 
    private cdr: ChangeDetectorRef,
    private categoryService: CategoryService,
    public cartService: CartService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
        next: (user) => {
            this.currentUser = user;
            this.isLoaded = true;
            this.isAuthenticated = this.authService.isAuthenticated();
            this.cdr.detectChanges();
        }
    });
 this.cartService.refreshCartCount();
    this.loadMainCategories();
    
    // إضافة event listeners للعناصر الجديدة
    setTimeout(() => {
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.hideMobileSidebar();
            });
        }
    }, 0);
}

//   showMobileSidebar() {
//     const sidebar = document.getElementById('sidebar');
//     const overlay = document.getElementById('overlay');
//     if (sidebar && overlay) {
//         sidebar.classList.add('active');
//         overlay.classList.add('active');
//         document.body.style.overflow = 'hidden';
//     }
// }

showMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar && overlay) {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // يمنع سكرول تحت السايدبار
  }
}

// hideMobileSidebar() {
//     const sidebar = document.getElementById('sidebar');
//     const overlay = document.getElementById('overlay');
//     if (sidebar && overlay) {
//         sidebar.classList.remove('active');
//         overlay.classList.remove('active');
//         document.body.style.overflow = 'auto';
//     }
// }

hideMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar && overlay) {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

toggleMobileSearch() {
    const mobileSearch = document.querySelector('.mobile-search-container');
    if (mobileSearch) {
        mobileSearch.classList.toggle('active');
    }
}


  loadMainCategories() {
    this.categoryService.getMainCategories().subscribe({
      next: (categories) => {
        this.mainCategories = categories;
        categories.forEach(category => {
          if (category.hasSubCategories) {
            this.loadSubCategories(category);
          }
        });
      },
      error: (err) => {
        console.error('Error loading main categories:', err);
      }
    });
  }

  loadSubCategories(category: Category) {
    this.categoryService.getSubCategories(category.categoryId).subscribe({
      next: (subCategories) => {
        if (category.name.toLowerCase() === 'furniture') {
          this.loadFurnitureSubCategories(subCategories);
        } else {
          this.subCategories[category.name.toLowerCase()] = subCategories;
        }
      },
      error: (err) => {
        console.error(`Error loading subcategories for ${category.name}:`, err);
      }
    });
  }

  loadFurnitureSubCategories(rooms: Category[]) {
  rooms.forEach(room => {
    if (room.hasSubCategories) {
      this.categoryService.getSubCategories(room.categoryId).subscribe({
        next: (items) => {
          this.furnitureData[room.name] = items;
          
          // تحديث الكونفيج للعناصر الجديدة
          items.forEach(item => {
            const normalizedName = item.name.toLowerCase();
            this.categoryConfig[normalizedName] = {
              id: item.categoryId,
              hasItems: !item.hasSubCategories // إذا مالوش sub categories يبقى عنده items
            };
          });
        },
        error: (err) => {
          console.error(`Error loading furniture items for ${room.name}:`, err);
        }
      });
    }
  });
}

  getFurnitureRooms(): string[] {
    return ['Living Room', 'Dining Room', 'Bedroom', 'Kids Furniture', 'Outdoor', 'Kitchen & Dining', 'Home Office'];
  }

  // دالة للتنقل إلى صفحة الفئة
  // استبدل دالة navigateToCategory بهذه الدالة المحدثة
navigateToCategory(categoryName: string, hasItems: boolean = false) {
  const categoryId = this.getCategoryId(categoryName);
  
  if (hasItems && categoryId) {
    // إذا كان عنده items، يروح لصفحة المنتجات مع فلتر الفئة
    this.router.navigate(['/products'], { 
      queryParams: { 
        categoryId: categoryId,
        categoryName: categoryName
      }
    });
  } else if (categoryId) {
    // إذا كان category عادي، يروح لصفحة الكاتيجوري
    this.router.navigate(['/category', categoryId]);
  } else {
    // fallback للأسماء غير المعروفة
    this.router.navigate(['/category', this.normalizeName(categoryName)]);
  }
  
  this.hideMegaMenu();
  this.hideMobileSidebar();
}

// إضافة دالة منفصلة للتنقل للمنتجات مباشرة
navigateToProducts(categoryId: number, categoryName: string) {
  this.router.navigate(['/products'], { 
    queryParams: { 
      categoryId: categoryId,
      categoryName: categoryName
    }
  });
  this.hideMegaMenu();
  this.hideMobileSidebar();
}

// إضافة دالة للتنقل للكاتيجوري مباشرة
navigateToCategoryPage(categoryId: number) {
  this.router.navigate(['/category', categoryId]);
  this.hideMegaMenu();
  this.hideMobileSidebar();
}

// تحديث الخريطة لتشمل معلومات عن نوع كل فئة
private categoryConfig: { [key: string]: { id: number, hasItems: boolean } } = {
  // الفئات الرئيسية (لها صفحات كاتيجوري)
  'furniture': { id: 511, hasItems: false },
  'lighting': { id: 541, hasItems: false },
  'decor': { id: 543, hasItems: false },
  'bedding & bath': { id: 545, hasItems: false },
  'appliances': { id: 547, hasItems: false },
  'rugs': { id: 548, hasItems: false },
  
  // الفئات الفرعية (لها منتجات مباشرة)
  'living room': { id: 512, hasItems: false }, // room category
  'dining room': { id: 537, hasItems: false }, // room category
  'bedroom': { id: 524, hasItems: false }, // room category
  'kids furniture': { id: 546, hasItems: false }, // room category
  'outdoor': { id: 540, hasItems: false }, // room category
  'kitchen & dining': { id: 544, hasItems: false }, // room category
  'home office': { id: 518, hasItems: false }, // room category
  
  // العناصر النهائية (لها منتجات مباشرة)
  'accent & arm chairs': { id: 513, hasItems: true },
  'end & side tables': { id: 514, hasItems: true },
  'pouf & stools': { id: 515, hasItems: true },
  'consoles & back sofas': { id: 516, hasItems: true },
  'media consoles & tv units': { id: 517, hasItems: true },
  'storage solutions': { id: 518, hasItems: true },
  'ottomans & benches': { id: 519, hasItems: true },
  'sofa beds & daybeds': { id: 520, hasItems: true },
  'chaise lounges': { id: 521, hasItems: true },
  'coffee tables': { id: 522, hasItems: true },
  'sofa & sectionals': { id: 523, hasItems: true }
};

// تحديث getCategoryId لتستخدم الكونفيج الجديد
getCategoryId(categoryName: string): number | null {
  const normalizedName = categoryName.toLowerCase();
  const config = this.categoryConfig[normalizedName];
  return config ? config.id : null;
}

// إضافة دالة للتحقق من نوع الفئة
hasDirectItems(categoryName: string): boolean {
  const normalizedName = categoryName.toLowerCase();
  const config = this.categoryConfig[normalizedName];
  return config ? config.hasItems : false;
}


  getCategoryRoute(categoryName: string): string {
    const categoryId = this.getCategoryId(categoryName);
    return categoryId ? categoryId.toString() : this.normalizeName(categoryName);
  }

  private normalizeName(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    console.log('Search query:', target.value);
  }

  onActionClick(action: string) {
    if (action === 'logout') {
      this.authService.logout();
      this.cartService.refreshCartCount();
      this.currentUser = this.authService.getCurrentUser();
      this.cdr.detectChanges();
      this.router.navigate([`/login`]);
    } else if (action === 'profile' || action === 'orders') {
      // Navigate to dashboard with the specific section
      this.router.navigate([`/dashboard/${action}`]);
    } else {
      this.router.navigate([`/${action}`]);
    }
  }

  showMegaMenu(menu: string) {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    this.activeMenu = menu;
  }

  onNavItemLeave() {
    this.hideTimeout = setTimeout(() => {
      this.hideMegaMenu();
    }, 300);
  }

  hideMegaMenu() {
    this.activeMenu = '';
  }

  keepMenuOpen() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }


}
