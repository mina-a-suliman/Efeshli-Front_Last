// src/app/pages/home/home.component.ts
import { Component, ElementRef, ViewChild, AfterViewInit, Renderer2, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrandService } from '../../core/services/brand.service';
import { Brand } from '../../core/models/brand.model';
import { CollectionService } from '../../core/services/collection.service';
import { CollectionProduct } from '../../core/models/collection.model';
import { OutdoorService } from '../../core/services/outdoor.service';
import { OutdoorProduct } from '../../core/models/outdoor.model';
import { RugsService } from '../../core/services/rugs.service';
import { RugsProduct } from '../../core/models/rugs.model';
import { RoomService } from '../../core/services/room.service'; // خدمة جديدة للغرف
import { RoomProduct } from '../../core/models/room.model'; // نموذج جديد للغرف
import { AdService } from '../../core/services/ad.service';
import { AdProduct } from '../../core/models/ad.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit, OnInit {
  @ViewChild('carouselSlides') carouselSlides!: ElementRef;
  @ViewChild('carouselPrev') carouselPrev!: ElementRef;
  @ViewChild('carouselNext') carouselNext!: ElementRef;

  private currentSlide = 0;
  private slideWidth = 0;
  private totalSlides = 0;

  brands: Brand[] = [];
  collectionProducts: CollectionProduct[] = [];
  outdoorProducts: OutdoorProduct[] = [];
  rugsProducts: RugsProduct[] = [];
  
  // صور افتراضية للغرف (يمكن استبدالها بصور من الباك اند)
  livingroomImage = "https://dkq2tfmdsh9ss.cloudfront.net/page-sections/K5Cd7u5xotjZJFo7THHlFf8UX6f4kmpfjX3rsE9h.webp";
  bedroomImage = "https://dkq2tfmdsh9ss.cloudfront.net/page-sections/NJkr7u4si126gw4v0hHYJRt1B2gO8IEzjovgG6lU.webp";
  diningroomImage = "https://dkq2tfmdsh9ss.cloudfront.net/page-sections/ntup6DGWCZ7UbGD5ZyCHbWh0nTq4Qxh2Lbh56zLm.webp";
  
  // منتجات الغرف (إذا أردنا عرض منتجات بدلاً من الصور الثابتة)
  livingroomProducts: RoomProduct[] = [];
  bedroomProducts: RoomProduct[] = [];
  diningroomProducts: RoomProduct[] = [];
  
  isLoading: boolean = true;
  isOutdoorLoading: boolean = true;
  isRugsLoading: boolean = true;
  isRoomLoading: boolean = true; // حالة تحميل الغرف

  adProduct: AdProduct | null = null;
isAdLoading: boolean = true;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private brandService: BrandService,
    private collectionService: CollectionService,
    private outdoorService: OutdoorService,
    private rugsService: RugsService,
    private roomService: RoomService, // خدمة الغرف الجديدة
    private adService: AdService
  ) {}

  ngOnInit(): void {
    this.loadBrands();
    this.loadCollections();
    this.loadOutdoorProducts();
    this.loadRugsProducts();
    this.loadRoomProducts(); // تحميل منتجات الغرف
    // this.loadAdData();
  }

  // ngAfterViewInit() {
  //   // سيتم استدعاء setupCarousel بعد تحميل البيانات
  // }

  ngAfterViewInit() {
    this.slideWidth = this.carouselSlides.nativeElement.clientWidth / 5; // 5 slides visible
    this.totalSlides = this.carouselSlides.nativeElement.children.length;
    this.updateSlidePosition();
    this.updateButtonVisibility();
  }

//   loadAdData(): void {
//   this.adService.getAdData(119).subscribe({
//     next: (response) => {
//       if (response.succeeded && response.data.items.length > 0) {
//         this.adProduct = response.data.items[0];
//       }
//       this.isAdLoading = false;
//     },
//     error: (err) => {
//       console.error('Error fetching ad data:', err);
//       this.isAdLoading = false;
//     }
//   });
// }

  loadBrands(): void {
    this.brandService.getAllBrands().subscribe({
      next: (res) => {
        if (res.succeeded) {
          this.brands = res.data;
        }
      },
      error: (err) => {
        console.error('Error fetching brands:', err);
      }
    });
  }

  loadCollections(): void {
    this.collectionService.getCollections().subscribe({
      next: (response) => {
        this.collectionProducts = response.items;
        this.isLoading = false;
        
        // إعداد الكاروسيل بعد تحميل البيانات
        setTimeout(() => {
          this.setupCarousel();
        }, 100);
      },
      error: (err) => {
        console.error('Error fetching collections:', err);
        this.isLoading = false;
      }
    });
  }

  loadOutdoorProducts(): void {
    this.outdoorService.getOutdoorProducts(1, 24).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.outdoorProducts = response.data.items;
        }
        this.isOutdoorLoading = false;
      },
      error: (err) => {
        console.error('Error fetching outdoor products:', err);
        this.isOutdoorLoading = false;
      }
    });
  }

  loadRugsProducts(): void {
    this.rugsService.getRugsProducts(1, 24).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.rugsProducts = response.data.items;
        }
        this.isRugsLoading = false;
      },
      error: (err) => {
        console.error('Error fetching rugs products:', err);
        this.isRugsLoading = false;
      }
    });
  }
navigateToOutdoorProducts(): void {
  // للمنتجات الخارجية - استخدام API المحدد
  this.router.navigate(['/products'], {
    queryParams: {
      collection: 'outdoor',
      pageNumber: 1,
      pageSize: 24
    }
  });
}

navigateToRugsProducts(): void {
  // للسجاد
  this.router.navigate(['/products'], {
    queryParams: {
      categoryId: 548, // Rugs category ID
      pageNumber: 1,
      pageSize: 24
    }
  });
}
navigateToAllBrands(): void {
  // لصفحة البراندات
  this.router.navigate(['/brands']);
}
  loadRoomProducts(): void {
    // تحميل منتجات غرفة المعيشة
    this.roomService.getRoomProducts('livingroom', 1, 1).subscribe({
      next: (response) => {
        if (response.succeeded && response.data.items.length > 0) {
          this.livingroomProducts = response.data.items;
          // إذا كان هناك منتجات، يمكن استخدام صورة المنتج الأول
          this.livingroomImage = this.livingroomProducts[0].imageUrl;
        }
        this.isRoomLoading = false;
      },
      error: (err) => {
        console.error('Error fetching livingroom products:', err);
        this.isRoomLoading = false;
      }
    });

    // تحميل منتجات غرفة النوم
    this.roomService.getRoomProducts('bedroom', 1, 1).subscribe({
      next: (response) => {
        if (response.succeeded && response.data.items.length > 0) {
          this.bedroomProducts = response.data.items;
          this.bedroomImage = this.bedroomProducts[0].imageUrl;
        }
      },
      error: (err) => {
        console.error('Error fetching bedroom products:', err);
      }
    });

    // تحميل منتجات غرفة الطعام
    this.roomService.getRoomProducts('diningroom', 1, 1).subscribe({
      next: (response) => {
        if (response.succeeded && response.data.items.length > 0) {
          this.diningroomProducts = response.data.items;
          this.diningroomImage = this.diningroomProducts[0].imageUrl;
        }
      },
      error: (err) => {
        console.error('Error fetching diningroom products:', err);
      }
    });
  }

  setupCarousel(): void {
    if (this.collectionProducts.length > 0) {
      this.slideWidth = this.carouselSlides.nativeElement.clientWidth / 5;
      this.totalSlides = this.collectionProducts.length;
      this.updateSlidePosition();
      this.updateButtonVisibility();
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.updateSlidePosition();
      this.updateButtonVisibility();
    }
  }

  nextSlide() {
    if (this.currentSlide < this.totalSlides - 5) {
      this.currentSlide++;
      this.updateSlidePosition();
      this.updateButtonVisibility();
    }
  }

  private updateSlidePosition() {
    if (this.carouselSlides && this.carouselSlides.nativeElement) {
      this.carouselSlides.nativeElement.style.transform =
        `translateX(-${this.currentSlide * this.slideWidth}px)`;
    }
  }

  private updateButtonVisibility() {
    if (this.carouselPrev && this.carouselNext) {
      this.renderer.setStyle(this.carouselPrev.nativeElement, 'opacity', this.currentSlide === 0 ? '0' : '1');
      this.renderer.setStyle(this.carouselPrev.nativeElement, 'pointer-events', this.currentSlide === 0 ? 'none' : 'auto');
      this.renderer.setStyle(this.carouselNext.nativeElement, 'opacity', this.currentSlide >= this.totalSlides - 5 ? '0' : '1');
      this.renderer.setStyle(this.carouselNext.nativeElement, 'pointer-events', this.currentSlide >= this.totalSlides - 5 ? 'none' : 'auto');
    }
  }

  // getShortDescription(description: string): string {
  //   const words = description.split(' ');
  //   return words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '');
  // }
}