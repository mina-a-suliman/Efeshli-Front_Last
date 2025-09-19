import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
  imports: [CommonModule]
})
export class CategoryComponent implements OnInit {
  categoryName: string = '';
  categoryItems: Category[] = [];
  currentRoute: string = '';
  isLoading: boolean = true;

  // private mapNameToId: { [key: string]: number } = {
  //   'furniture': 511,
  //   'lighting': 541,
  //   'rug': 548,
  //   'rugs': 548,
  //   'bedding-bath': 545,
  //   'bedding': 545,
  //   'decor': 543,
  //   'appliances': 547
  // };

  private mapNameToId: { [key: string]: number } = {
  'furniture': 511,
  'lighting': 541,
  'rug': 548,
  'rugs': 548,
  'bedding': 545,  // تم التغيير من 'bedding-bath' إلى 'bedding'
  'decor': 543,
  'appliances': 547
};
  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const categoryParam = params.get('category');
      if (categoryParam) {
        this.isLoading = true;
        this.currentRoute = `shop > category > ${this.formatCategoryName(categoryParam)}`;
        const id = this.getCategoryId(categoryParam);
        
        if (id !== null) {
          this.loadCategoryData(id, categoryParam);
        } else {
          // إذا كانت المعلمة رقمية (معرف مباشر)
          const numericId = parseInt(categoryParam, 10);
          if (!isNaN(numericId)) {
            this.loadCategoryData(numericId, categoryParam);
          } else {
            console.error('Category not found');
            this.isLoading = false;
          }
        }
      }
    });
  }

  private loadCategoryData(id: number, categoryParam: string) {
    // الحصول على الفئات الفرعية من API
    this.categoryService.getSubCategories(id).subscribe({
      next: (subs: Category[]) => {
        this.categoryItems = subs;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching subcategories', err);
        this.isLoading = false;
      }
    });

    // الحصول على اسم الفئة الرئيسية
    // إذا كانت المعلمة رقمية، نحتاج إلى الحصول على الاسم من API
    if (!isNaN(parseInt(categoryParam, 10))) {
      this.categoryService.getCategoryDetails(id).subscribe({
        next: (cat: Category) => {
          this.categoryName = cat.name || this.formatCategoryName(categoryParam);
        },
        error: () => {
          this.categoryName = this.formatCategoryName(categoryParam);
        }
      });
    } else {
      // إذا كانت المعلمة نصية، نستخدمها مباشرة كاسم
      this.categoryName = this.formatCategoryName(categoryParam);
    }
  }

  private getCategoryId(param: string): number | null {
    // إذا كانت المعلمة رقمية، نستخدمها مباشرة
    const num = +param;
    if (!isNaN(num)) {
      return num;
    }
    // وإلا نبحث في الخريطة
    return this.mapNameToId[param.toLowerCase()] || null;
  }

  private formatCategoryName(param: string): string {
    return param.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // للتنقل إلى صفحة الفئة الفرعية
  navigateToSubCategory(category: Category) {
    if (category.hasSubCategories) {
      // إذا كانت تحتوي على فئات فرعية، انتقل إلى صفحة الفئة الفرعية
      const routeName = category.name.toLowerCase().replace(/\s+/g, '-');
      this.router.navigate(['/category', routeName]);
    } else {
      // إذا لم تكن تحتوي على فئات فرعية، انتقل إلى صفحة المنتجات
      this.router.navigate(['/products'], { 
        queryParams: { category: category.categoryId } 
      });
    }
  }
}