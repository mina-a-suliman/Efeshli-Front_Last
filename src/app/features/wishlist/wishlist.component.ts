import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Router,RouterLink, ActivatedRoute } from '@angular/router'; 
import { AuthService } from '../../core/services/auth.service';
import { ProductHeartButtonComponent } from '../product-heart-button/product-heart-button'; // ✅ Fixed import path

import { 
  WishlistDto, 
  WishlistSummaryDto, 
  WishlistItemDto,
  CreateWishlistRequest,
  UpdateWishlistRequest
} from '../../core/models/wishlist.models';
import { WishlistService } from '../../core/services/Wishlist.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html', // ✅ Use external template
  styleUrls: ['./wishlist.component.css'], // ✅ Fixed styleUrls (plural)
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ProductHeartButtonComponent, RouterLink],
  standalone: true
})
export class WishlistComponent implements OnInit, OnDestroy {
  @Output() itemRemoved = new EventEmitter<{wishlistId: number, productId: number}>();
  @Output() itemAdded = new EventEmitter<{wishlistId: number, productId: number}>();

  wishlistsSummary: WishlistSummaryDto[] = [];
  selectedList: WishlistDto | null = null;
  showCreatePopup = false;
  showDeleteConfirm = false;
  newListName = '';
  state: 'empty' | 'list' | 'detail' = 'empty';
  loading = false;
  creatingList = false;
  deletingWishlist = false;
  
  // Edit name
  editListName = '';
  showEditPopup = false;
  updatingList = false;

  
  private destroy$ = new Subject<void>();

  constructor(
    private wishlistService: WishlistService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.subscribeToData();
    this.handleRouteParams();
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getEmptySlots(imageCount: number): number[] {
    const maxSlots = 3;
    const usedSlots = Math.min(imageCount - 1, maxSlots);
    const emptySlots = Math.max(0, maxSlots - usedSlots);
    return Array(emptySlots).fill(0).map((_, i) => i);
  }

  private handleRouteParams() {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const wishlistId = params['id'];
        if (wishlistId) {
          this.loadWishlistById(+wishlistId);
        } else {
          this.state = this.wishlistsSummary.length > 0 ? 'list' : 'empty';
        }
      });
  }

  private loadWishlistById(wishlistId: number) {
    this.loading = true;
    
    this.wishlistService.getWishlistById(wishlistId, false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (wishlistDetails) => {
          if (wishlistDetails) {
            this.selectedList = wishlistDetails;
            this.state = 'detail';
          } else {
            this.navigateToWishlists();
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading wishlist:', error);
          this.navigateToWishlists();
          this.loading = false;
        }
      });
  }

  private subscribeToData() {
    this.wishlistService.userWishlistsSummary$
      .pipe(takeUntil(this.destroy$))
      .subscribe(wishlists => {
        this.wishlistsSummary = wishlists;
        this.updateState();
      });

    this.wishlistService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
      });
  }

  private loadInitialData() {
    console.log('Component initialized, waiting for auth...');
  }

  private updateState() {
    if (this.wishlistsSummary.length === 0) {
      this.state = 'empty';
      this.selectedList = null;
    } else if (this.selectedList) {
      this.state = 'detail';
    } else {
      this.state = 'list';
    }
  }

  // ================== Create Wishlist ==================
  openCreatePopup() {
    this.showCreatePopup = true;
    this.newListName = '';
  }

  closeCreatePopup() {
    this.showCreatePopup = false;
    this.newListName = '';
    this.creatingList = false;
  }

  createList() {
    if (!this.newListName.trim() || this.creatingList) return;
    
    this.creatingList = true;
    const request: CreateWishlistRequest = {
      name: this.newListName.trim(),
      isPublic: false
    };

    this.wishlistService.createWishlist(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.creatingList = false;
          if (result) {
            this.closeCreatePopup();
          }
        },
        error: (error) => {
          console.error('Error creating wishlist:', error);
          this.creatingList = false;
        }
      });
  }

  // ================== Navigation ==================
  navigateToWishlist(listSummary: WishlistSummaryDto) {
    this.router.navigate(['/wishlist', listSummary.wishlistId]);
  }

  navigateToWishlists() {
    this.router.navigate(['/wishlist']);
  }

  backToLists() {
    this.selectedList = null;
    this.state = 'list';
    this.navigateToWishlists();
  }

  // ================== Edit Wishlist Name ==================
  startEditName() {
    if (!this.selectedList) return;
    this.editListName = this.selectedList.wishlistName;
    this.showEditPopup = true;
    this.updatingList = false;
    
    // Focus the input after popup opens
    setTimeout(() => {
      const editInput = document.querySelector('#editInput') as HTMLInputElement;
      if (editInput) {
        editInput.focus();
        editInput.select();
      }
    }, 100);
  }
private closeEditPopup() {
    this.showEditPopup = false;
    this.editListName = '';
    this.updatingList = false;
  }
  saveListName() {
    if (!this.selectedList || !this.editListName.trim()) return;
        this.updatingList = true;
    const request: UpdateWishlistRequest = {
      wishlistId: this.selectedList.wishlistId,
      name: this.editListName.trim(),
      isPublic: true
    };

    this.wishlistService.updateWishlist(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success) => {
           this.updatingList = false;
          if (success && this.selectedList) {
            // Update the name in both selected list and summary
            const oldName = this.selectedList.wishlistName;
            this.selectedList.wishlistName = this.editListName.trim();
            
            // Update in summary list
            const summaryIndex = this.wishlistsSummary.findIndex(
              s => s.wishlistId === this.selectedList!.wishlistId
            );
            if (summaryIndex >= 0) {
              this.wishlistsSummary[summaryIndex].wishlistName = this.editListName.trim();
            }
            
            this.closeEditPopup();
            this.showSuccessMessage(`Wishlist renamed from "${oldName}" to "${this.editListName.trim()}"`);
             this.showEditPopup = false;
            this.editListName = '';
            this.updatingList = false;
          }
        },
        error: (error) => {
          console.error('Error updating wishlist name:', error);
          this.updatingList = false;

        }
      });
  }

  cancelEditName() {
    this.closeEditPopup();

  }

  // ================== Delete Wishlist ==================
  confirmDeleteWishlist() {
    if (!this.selectedList) {
      console.error('No wishlist selected');
      return;
    }
    
    this.showDeleteConfirm = true;
    this.deletingWishlist = false;
  }


  deleteWishlist() {
    if (!this.selectedList || this.deletingWishlist) return;
    
    this.deletingWishlist = true;
    const listToDelete = this.selectedList;
    const listName = listToDelete.wishlistName;

    this.wishlistService.deleteWishlist(listToDelete.wishlistId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success) => {
          if (success) {
            this.wishlistsSummary = this.wishlistsSummary.filter(
              s => s.wishlistId !== listToDelete.wishlistId
            );
            this.selectedList = null;
            this.showDeleteConfirm = false;
            this.state = this.wishlistsSummary.length > 0 ? 'list' : 'empty';
            this.showSuccessMessage(`Wishlist "${listName}" deleted.`);
            this.backToLists();
          }
          this.deletingWishlist = false;
        },
        error: (error) => {
          console.error('Error deleting wishlist:', error);
          this.deletingWishlist = false;
        }
      });
  }
  cancelDeleteWishlist() {
    this.showDeleteConfirm = false;
    this.deletingWishlist = false;
  }
  // ================== Item Management ==================
  removeItem(item: WishlistItemDto) {
    if (!this.selectedList) return;
    const wishlistId = this.selectedList.wishlistId;
    const productId = item.productId; 

    if (confirm('Remove this item from your wishlist?')) {
       const originalItems = [...(this.selectedList.wishlistItemsDto || [])];
    const originalCount = this.selectedList.itemsCount;
    
    // Update UI immediately
    this.selectedList.wishlistItemsDto = this.selectedList.wishlistItemsDto
      ?.filter(i => i.productId !== productId) || [];
    this.selectedList.itemsCount = Math.max(0, this.selectedList.itemsCount - 1);
    
    // Update summary count immediately
    const summaryIndex = this.wishlistsSummary
      .findIndex(s => s.wishlistId === wishlistId);
    if (summaryIndex >= 0) {
      this.wishlistsSummary[summaryIndex].itemsCount = this.selectedList.itemsCount;
    }

      this.wishlistService.removeItemFromWishlist(this.selectedList.wishlistId, item.productId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success && this.selectedList) {
              this.selectedList.wishlistItemsDto = this.selectedList.wishlistItemsDto
                ?.filter(i => i.productId !== item.productId);
              this.selectedList.itemsCount = Math.max(0, this.selectedList.itemsCount - 1);
              this.itemRemoved.emit({ wishlistId, productId });
              // Update summary count

              const summaryIndex = this.wishlistsSummary
                .findIndex(s => s.wishlistId === this.selectedList!.wishlistId);
              if (summaryIndex >= 0) {
                this.wishlistsSummary[summaryIndex].itemsCount = this.selectedList.itemsCount;
              }
            }
          },
          error: (error) => {
            console.error('Error removing item:', error);
          }
        });
    }
  }

  addToCart(item: WishlistItemDto) {
    console.log('Adding to cart:', item);
  }

  // ================== Share & Navigation ==================
  shareWishlist(wishlist: WishlistSummaryDto | WishlistDto, event: Event) {
    event.stopPropagation();
    console.log('Sharing wishlist:', wishlist);
    
    const shareUrl = `${window.location.origin}/wishlist/${wishlist.wishlistId}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Check out my wishlist: ${wishlist.wishlistName}`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Wishlist URL copied to clipboard!');
      });
    }
  }

  goToShopping() {
    console.log('Navigate to shopping');
  }
  private showSuccessMessage(message: string) {
    // You can implement a toast notification here
    console.log('Success:', message);
    // Example: this.notificationService.showSuccess(message);
  }

  private showErrorMessage(message: string) {
    // You can implement a toast notification here
    console.error('Error:', message);
    alert(message); // Temporary - replace with proper notification
  }
  onWishlistToggled(event: { productId: number; added: boolean }): void {
  console.log('Wishlist toggled:', event);
  
  if (!event.added && this.selectedList) {
    // Product was removed from wishlist
    const { productId } = event;
    
    // Update the local state immediately
    this.selectedList.wishlistItemsDto = this.selectedList.wishlistItemsDto
      ?.filter(item => item.productId !== productId) || [];
    
    // Update item count
    this.selectedList.itemsCount = Math.max(0, this.selectedList.itemsCount - 1);
    
    // Update summary
    const summaryIndex = this.wishlistsSummary
      .findIndex(s => s.wishlistId === this.selectedList!.wishlistId);
    if (summaryIndex >= 0) {
      this.wishlistsSummary[summaryIndex].itemsCount = this.selectedList.itemsCount;
      
      // Update main images if needed
      this.updateMainImages(summaryIndex);
    }
    this.itemRemoved.emit({ wishlistId: this.selectedList.wishlistId, productId });
    console.log(`Product ${productId} removed from ${this.selectedList.wishlistName}`);
  } else if (event.added) {
    console.log(`Product ${event.productId} added to wishlist`);
    // Handle addition if needed
  }

  }
  private updateMainImages(summaryIndex: number): void {
  if (summaryIndex < 0 || !this.selectedList) return;

  // Update main images from remaining items
  const remainingImages = this.selectedList.wishlistItemsDto
    ?.slice(0, 4)
    .map(item => item.imageUrl)
    .filter((url): url is string => url != null && url !== '') || [];

  this.wishlistsSummary[summaryIndex].mainImages = remainingImages;
  }
}