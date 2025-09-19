import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { WishlistService } from '../../core/services/Wishlist.service';
import { WishlistDropdownOption, CreateWishlistRequest } from '../../core/models/wishlist.models';

@Component({
  selector: 'app-wishlist-dropdown',
  template: `
    <div class="wishlist-dropdown-overlay" *ngIf="isVisible" (click)="onBackdropClick()">
      <div class="wishlist-dropdown" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="dropdown-header">
          <span>Choose Wishlist</span>
          <button class="close-btn" (click)="onClose()">×</button>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Loading wishlists...</span>
        </div>

        <!-- Wishlists List -->
        <div *ngIf="!loading" class="wishlists-list">
          <div *ngFor="let wishlist of wishlists" 
               class="wishlist-item"
               [class.processing]="processingWishlistId === wishlist.wishlistId"
               (click)="onWishlistClick(wishlist)">
            
            <div class="wishlist-info">
              <span class="wishlist-name">{{ wishlist.wishlistName }}</span>
              <span class="items-count">{{ wishlist.itemsCount }} items</span>
            </div>
            
            <div class="wishlist-action">
              <i class="fas fa-heart" 
                 [class.active]="wishlist.isInWishlist"
                 [class.processing]="processingWishlistId === wishlist.wishlistId">
              </i>
              <i *ngIf="processingWishlistId === wishlist.wishlistId" 
                 class="fas fa-spinner fa-spin processing-spinner"></i>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="wishlists.length === 0" class="empty-state">
            <i class="far fa-heart"></i>
            <span>No wishlists found</span>
          </div>
        </div>

        <!-- Create New Wishlist -->
        <div class="create-section">
          <div *ngIf="!showCreateForm" class="create-trigger">
            <button class="create-new-btn" (click)="showCreateForm = true">
              <i class="fas fa-plus"></i>
              Create New List
            </button>
          </div>

          <div *ngIf="showCreateForm" class="create-form">
            <input [(ngModel)]="newListName" 
                   placeholder="Enter list name"
                   class="create-input"
                   (keyup.enter)="createNewWishlist()"
                   (keyup.escape)="cancelCreate()">
            <div class="create-actions">
              <button class="create-btn" 
                      (click)="createNewWishlist()"
                      [disabled]="!newListName.trim() || creatingList">
                <i *ngIf="creatingList" class="fas fa-spinner fa-spin"></i>
                <span *ngIf="!creatingList">Create</span>
                <span *ngIf="creatingList">Creating...</span>
              </button>
              <button class="cancel-btn" (click)="cancelCreate()">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wishlist-dropdown-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .wishlist-dropdown {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      width: 320px;
      max-height: 500px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .dropdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #eee;
      font-weight: 600;
      background: #f8f9fa;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #666;
      padding: 4px;
      border-radius: 4px;
    }

    .close-btn:hover {
      background: #e9ecef;
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: #666;
      gap: 8px;
    }

    .wishlists-list {
      flex: 1;
      overflow-y: auto;
      max-height: 300px;
    }

    .wishlist-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s;
    }

    .wishlist-item:hover:not(.processing) {
      background: #f8f9fa;
    }

    .wishlist-item.processing {
      background: #f0f8ff;
      cursor: not-allowed;
    }

    .wishlist-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .wishlist-name {
      font-weight: 500;
      color: #333;
    }

    .items-count {
      font-size: 12px;
      color: #666;
    }

    .wishlist-action {
      position: relative;
      display: flex;
      align-items: center;
    }

    .fa-heart {
      font-size: 18px;
      color: #ddd;
      transition: all 0.3s ease;
    }

    .fa-heart.active {
      color: #e91e63;
      transform: scale(1.1);
    }

    .processing-spinner {
      position: absolute;
      font-size: 14px;
      color: #007bff;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      color: #666;
      gap: 8px;
    }

    .empty-state i {
      font-size: 24px;
      color: #ddd;
    }

    .create-section {
      border-top: 1px solid #eee;
      padding: 16px 20px;
      background: #f8f9fa;
    }

    .create-new-btn {
      width: 100%;
      padding: 10px;
      border: 2px dashed #ddd;
      background: none;
      color: #666;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 14px;
      transition: all 0.2s;
    }

    .create-new-btn:hover {
      border-color: #007bff;
      color: #007bff;
    }

    .create-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .create-input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }

    .create-input:focus {
      outline: none;
      border-color: #007bff;
    }

    .create-actions {
      display: flex;
      gap: 8px;
    }

    .create-btn, .cancel-btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      border: 1px solid;
      transition: all 0.2s;
    }

    .create-btn {
      background: #007bff;
      color: white;
      border-color: #007bff;
      flex: 1;
    }

    .create-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .cancel-btn {
      background: none;
      color: #666;
      border-color: #ddd;
    }

    .cancel-btn:hover {
      background: #f8f9fa;
    }
  `],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class WishlistDropdownComponent implements OnInit, OnDestroy, OnChanges {
  @Input() productId!: number;
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() itemAdded = new EventEmitter<{ wishlistId: number, productId: number }>();
  @Output() itemRemoved = new EventEmitter<{ wishlistId: number, productId: number }>();
  
  wishlists: WishlistDropdownOption[] = [];
  loading = false;
  processingWishlistId: number | null = null;
  
  // Create new list
  showCreateForm = false;
  newListName = '';
  creatingList = false;
  
  private destroy$ = new Subject<void>();

  constructor(private wishlistService: WishlistService) {}

  ngOnInit() {
    if (this.productId && this.isVisible) {
      this.loadWishlists();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges() {
    if (this.isVisible && this.productId) {
      this.loadWishlists();
      this.resetCreateForm();
    }
  }

  private loadWishlists() {
    this.loading = true;
    this.wishlistService.getWishlistsDropdown(this.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.wishlists = response.data || [];
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading wishlists:', error);
          this.wishlists = [];
          this.loading = false;
        }
      });
  }

  onWishlistClick(wishlist: WishlistDropdownOption) {
    if (this.processingWishlistId === wishlist.wishlistId) return;
    
    this.processingWishlistId = wishlist.wishlistId;

    if (wishlist.isInWishlist) {
      this.removeFromWishlist(wishlist);
    } else {
      this.addToWishlist(wishlist);
    }
  }

  private addToWishlist(wishlist: WishlistDropdownOption) {
    this.wishlistService.addItemToWishlist(wishlist.wishlistId, this.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.processingWishlistId = null;
          if (result) {
            wishlist.isInWishlist = true;
            wishlist.itemsCount++;
            this.itemAdded.emit({ wishlistId: wishlist.wishlistId, productId: this.productId });
          }
        },
        error: (error) => {
          console.error('Error adding to wishlist:', error);
          this.processingWishlistId = null;
        }
      });
  }

  private removeFromWishlist(wishlist: WishlistDropdownOption) {
    this.wishlistService.removeItemFromWishlist(wishlist.wishlistId, this.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success) => {
          this.processingWishlistId = null;
          if (success) {
            wishlist.isInWishlist = false;
            wishlist.itemsCount = Math.max(0, wishlist.itemsCount - 1);
            this.itemRemoved.emit({ wishlistId: wishlist.wishlistId, productId: this.productId });
          }
        },
        error: (error) => {
          console.error('Error removing from wishlist:', error);
          this.processingWishlistId = null;
        }
      });
  }

  createNewWishlist() {
    if (!this.newListName.trim() || this.creatingList) return;
    
    this.creatingList = true;
    const request: CreateWishlistRequest = {
      name: this.newListName.trim(),
      isPublic: false
    };

    this.wishlistService.createWishlist(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newWishlist) => {
          this.creatingList = false;
          if (newWishlist) {
            // إضافة الويشليست الجديدة للقائمة
            this.wishlists.push({
              wishlistId: newWishlist.wishlistId,
              wishlistName: newWishlist.wishlistName,
              itemsCount: 0,
              isInWishlist: false
            });
            this.resetCreateForm();
          }
        },
        error: (error) => {
          console.error('Error creating wishlist:', error);
          this.creatingList = false;
        }
      });
  }

  cancelCreate() {
    this.resetCreateForm();
  }

  private resetCreateForm() {
    this.showCreateForm = false;
    this.newListName = '';
    this.creatingList = false;
  }

  onBackdropClick() {
    this.close.emit();
  }

  onClose() {
    this.close.emit();
  }
}