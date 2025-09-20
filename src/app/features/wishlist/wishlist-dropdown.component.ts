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
          <span class="header-title">Save to:</span>
          <button *ngIf="!showCreateForm" 
                  class="create-new-btn" 
                  (click)="showCreateForm = true">
            Create New List
          </button>
        </div>
          <div class="create-section">
            <div *ngIf="showCreateForm" class="create-form">
              <div class="input-group">
                <input [(ngModel)]="newListName" 
                       placeholder="Enter list name"
                       class="create-input"
                       [disabled]="creatingList"
                       (keyup.enter)="createNewWishlist()"
                       (keyup.escape)="cancelCreate()"
                       #nameInput>
                <!-- Plus Icon Button -->
                <button class="plus-btn" 
                        (click)="createNewWishlist()"
                        [disabled]="!newListName.trim() || creatingList"
                        type="button">
                  <!-- Loading Spinner -->
                  <div *ngIf="creatingList" class="btn-spinner"></div>
                  <!-- Plus Icon -->
                  <svg *ngIf="!creatingList" 
                       width="16" 
                       height="16" 
                       viewBox="0 0 24 24" 
                       fill="none" 
                       xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5v14M5 12h14" 
                          stroke="currentColor" 
                          stroke-width="2" 
                          stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        <!-- Loading State -->
        <div *ngIf="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>Loading wishlists...</span>
        </div>

        <!-- Wishlists List -->
        <div *ngIf="!loading" class="wishlists-container">
          <div class="wishlists-list">
            <div *ngFor="let wishlist of wishlists" 
                 class="wishlist-item"
                 [class.processing]="processingWishlistId === wishlist.wishlistId"
                 [class.disabled]="processingWishlistId === wishlist.wishlistId"
                 (click)="onWishlistClick(wishlist)">
              
              <!-- Left Icon -->
              <svg data-name="Group 79934" xmlns="http://www.w3.org/2000/svg" width="49.896" height="28.217" viewBox="0 0 49.896 28.217">
              <g data-name="Group 79933">
                <path data-name="Path 35479" d="M479.373 128.755a6.172 6.172 0 0 1 .454-.955 6.5 6.5 0 0 1 .409.968c.225-.161.449-.32.68-.474.32.334.038.695-.164 1a1.734 1.734 0 0 1 .949.435 9.144 9.144 0 0 1-.955.27c.137.269.6.851.109.945a5.18 5.18 0 0 1-.705-.438 45.959 45.959 0 0 0 .362 5.212c.653-.659.648-1.612.954-2.431-.249-.074-.5-.151-.746-.227l.127-.393c.224-.055.451-.108.676-.161-.121-.214-.247-.427-.366-.641l.224-.323c.262.154.523.308.784.465.035-.292.071-.583.115-.874l.413.017.141.843q.4-.246.807-.478c.032.092.1.273.131.365l-.388.619c.272.076.545.153.819.234.025.071.077.215.1.286q-.445.144-.891.272a3.361 3.361 0 0 1 .346.929 8.957 8.957 0 0 1-.941-.361l-.106.631-.8-.023a16.539 16.539 0 0 0-1.061 2.444c1.031.064 2.063.015 3.1.031a3.848 3.848 0 0 1-.14 1.593c-.176.473-.5.874-.678 1.343.159.4.468.768.316 1.224h-6.346a1.452 1.452 0 0 1 .41-1.165 7.1 7.1 0 0 1-.771-1.563 6.426 6.426 0 0 1-.067-1.348c.939-.032 1.883.028 2.821-.061a8.918 8.918 0 0 0-.744-1.377c-.174-.275-.532-.276-.813-.361a45.556 45.556 0 0 1-.275-.538c-.3.079-.59.156-.888.22a1.469 1.469 0 0 1 .372-.951l-.755-.141c0-.161.007-.323.012-.483l.632-.131c-.169-.314-.363-.663-.144-1 .3.156.59.327.878.506.077-.34.06-.787.448-.939.1.308.186.619.273.932.218-.147.433-.3.654-.443.1.1.195.206.3.308-.153.247-.307.493-.456.74l.646-.028a22.346 22.346 0 0 0-.166-2.681c-.279.218-.6.557-.971.324.118-.313.25-.618.388-.922a1.624 1.624 0 0 1-.9-.413c.3-.106.6-.2.907-.288-.161-.24-.318-.481-.475-.723.126-.077.254-.153.384-.23.193.134.388.269.58.406m-.331 5.092a3.328 3.328 0 0 1 .3 1.258 1.469 1.469 0 0 0 .522.936 8.379 8.379 0 0 0-.15-2.034l-.67-.16m-1.362 4.116a2.8 2.8 0 0 0 .75 1.441 2.714 2.714 0 0 0 3.18.409 2.8 2.8 0 0 0 1.361-1.842 71.56 71.56 0 0 0-5.302-.005z" transform="translate(-469.11 -127.8)" style="fill: rgb(68, 68, 68);"></path>
                <g data-name="Group 79931">
                  <path data-name="Path 35481" d="M802.366 163.16a1.833 1.833 0 0 1 1.585-1.63c.678-.074 1.359-.023 2.04-.031 4.41 0 8.821.007 13.231-.006a2.422 2.422 0 0 1 1.492.336 2.226 2.226 0 0 1 .76 1.614c.038 1.069-.047 2.139.029 3.207a2.512 2.512 0 0 1 1.58.506 1.959 1.959 0 0 1 .595 1.525c.006 2.521-.016 5.045.007 7.568 0 .4-.031 8.143-.07 8.537l-.76-.009c-.049-.567-.067-8.489-.068-9.058-1.915-.071-3.833.044-5.746-.079-1.892-.076-3.782.1-5.67-.006-2.133 0-4.266-.041-6.4.064-1.326.076-2.656-.169-3.976.032 0 .566-.009 8.485-.042 9.049-.234.01-.468.019-.7.026-.1-2.726 0-12.81-.048-15.536a3.123 3.123 0 0 1 .347-1.957c.406-.534 1.13-.595 1.729-.772.1-1.125-.048-2.259.083-3.382m.823.441q-.015 4.094 0 8.19c1.612.058 3.225 0 4.837.022 4.184-.01 8.369.029 12.552-.017.035-2.735 0-5.47.016-8.2a1.08 1.08 0 0 0-1.083-1.211H804.39a1.143 1.143 0 0 0-1.2 1.223m18.543 3.84-.24.151a86.937 86.937 0 0 0 0 4.211c.429.013.859.019 1.29.02.026-.952.019-1.9.023-2.855a1.6 1.6 0 0 0-.225-1.026 2.612 2.612 0 0 0-.851-.5m-20.618 1.1c-.058 1.048-.028 2.1 0 3.149h1.165c.045-1.05.017-2.1.031-3.148-.031-.324.067-.733-.243-.949a.964.964 0 0 0-.957.951m-.106 4.171a26.67 26.67 0 0 0-.006 2c3.406.064 6.815.007 10.222.028 3.854-.009 7.709.013 11.563-.009.029-.678.029-1.357-.009-2.034-7.25-.006-14.507-.044-21.764.004z" transform="translate(-773.789 -156.59)" style="fill: rgb(68, 68, 68);"></path>
                  <path data-name="Path 35484" d="M843.93 186.267c.358.022.932-.17 1.032.321a.6.6 0 0 1-.855.708c-.419-.187-.231-.69-.177-1.029z" transform="translate(-811.081 -177.75)" style="fill: rgb(68, 68, 68);"></path>
                  <path data-name="Path 35485" d="M876.832 186.309a4.131 4.131 0 0 1 .848 0l.039.917c-.333.11-.779.288-1.035-.064a.547.547 0 0 1 .148-.853z" transform="translate(-839.016 -177.782)" style="fill: rgb(68, 68, 68);"></path>
                  <path data-name="Path 35486" d="M909.854 186.264c.358.013.89-.169 1.085.25.321.5-.455 1.15-.9.763a.811.811 0 0 1-.185-1.013z" transform="translate(-867.419 -177.74)" style="fill: rgb(68, 68, 68);"></path>
                  <path data-name="Path 35488" d="M876.786 205.791a.569.569 0 0 1 1.009-.006 3.72 3.72 0 0 1 .015.853l-.907.058c-.12-.282-.379-.617-.117-.905z" transform="translate(-839.139 -194.187)" style="fill: rgb(68, 68, 68);"></path>
                  <path data-name="Path 35491" d="M844.038 205.871c.372-.205.884.25.769.659-.015.621-1.08.611-1.153.028a.569.569 0 0 1 .384-.687z" transform="translate(-810.907 -194.477)" style="fill: rgb(68, 68, 68);"></path>
                  <path data-name="Path 35492" d="M910.28 205.99c.368-.536 1.358.144.992.682-.173.384-.653.24-.984.3-.066-.314-.257-.707-.008-.982z" transform="translate(-867.754 -194.455)" style="fill: rgb(68, 68, 68);"></path>
                </g>
                <path data-name="Path 35493" d="M426.333 222.5h22.309c.143 1.182.044 2.376.068 3.562-.025 1.176.071 9.709-.06 10.881-.3-.022-.6-.057-.906-.1-.025-1.016.028-9.388-.033-10.4-4.238-.058-8.478-.007-12.717-.025-2.584.022-5.169-.045-7.749.029-.058 1.021 0 9.4-.035 10.419-.294.022-.584.051-.877.073-.017-2.358-.026-12.072 0-14.43m.912 1.019a14.72 14.72 0 0 0 0 1.878c2.437.084 4.878.01 7.316.035 4.385-.017 8.771.035 13.156-.025a13.46 13.46 0 0 0 0-1.892c-4.141-.07-8.284-.01-12.427-.028-2.69.017-5.367-.047-8.045.028z" transform="translate(-426.316 -208.731)" style="fill: rgb(68, 68, 68);"></path>
              </g>
            </svg>
              
              <!-- Middle Content -->
              <div class="wishlist-info">
                <span class="wishlist-name">{{ wishlist.wishlistName }}</span>
                <span class="items-count">{{ wishlist.itemsCount }} {{ wishlist.itemsCount === 1 ? 'item' : 'items' }}</span>
              </div>
              
              <!-- Right Heart Button -->
              <div class="heart-action">
                <!-- Processing Spinner -->
                <div *ngIf="processingWishlistId === wishlist.wishlistId" class="processing-spinner"></div>
                
                <!-- Heart Icon -->
                <button *ngIf="processingWishlistId !== wishlist.wishlistId" 
                        class="heart-btn" 
                        [class.active]="wishlist.isInWishlist"
                        (click)="$event.stopPropagation(); onWishlistClick(wishlist)">
                  <!-- Empty Heart -->
                  <svg *ngIf="!wishlist.isInWishlist" 
                       class="heart-empty" 
                       width="24" 
                       height="24" 
                       viewBox="0 0 24 24" 
                       fill="none" 
                       xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                          stroke="currentColor" 
                          stroke-width="2" 
                          fill="none"/>
                  </svg>
                  
                  <!-- Filled Heart -->
                  <svg *ngIf="wishlist.isInWishlist" 
                       xmlns="http://www.w3.org/2000/svg" 
             width="33.3" 
             height="33.3" 
             viewBox="0 0 33.3 33.3">
          <g data-name="Add Wishlist">
            <g data-name="Group 79975">
              <path data-name="bg oval" 
                    d="M16.45 0A16.45 16.45 0 1 1 0 16.45 16.45 16.45 0 0 1 16.45 0z" 
                    transform="translate(.2 .2)" 
                    style="transition: 0.3s; opacity: 0.162; fill: rgb(237, 28, 35);">
              </path>
              <path data-name="" 
                    d="M13.947 1.168a4.311 4.311 0 0 1 1.241 3.122 4.311 4.311 0 0 1-1.241 3.122L7.594 14.02 1.241 7.412A4.311 4.311 0 0 1 0 4.29a4.311 4.311 0 0 1 1.241-3.122A3.536 3.536 0 0 1 3.925 0a3.536 3.536 0 0 1 2.683 1.168l.986 1.022 1.022-1.022a3.624 3.624 0 0 1 5.33 0z" 
                    transform="translate(9.2 9.639)" 
                    style="transition: 0.3s; fill: rgb(237, 28, 35);">
              </path>
            </g>
          </g>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="wishlists.length === 0" class="empty-state">
              <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                        stroke="currentColor" 
                        stroke-width="1.5" 
                        fill="none"/>
                </svg>
              </div>
              <span class="empty-text">No wishlists found</span>
              <p class="empty-subtitle">Create your first wishlist to get started</p>
            </div>
          </div>

          <!-- Create New Wishlist Section -->
          
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Overlay */
    .wishlist-dropdown-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(2px);
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Main Dropdown */
    .wishlist-dropdown {
      background: white;
      border-radius: 6px;
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06);
      width: 280px; /* ✅ Reduced from 380px */
      max-height: 400px; /* ✅ Reduced from 600px */
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s ease-out;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }

    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Header */
    .dropdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 18px;
      border-bottom: 1px solid #f0f0f0;
      background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-title {
      font-weight: 600;
      font-size: 16px;
      color: #1a1a1a;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #666;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      background: rgba(0, 0, 0, 0.08);
      color: #333;
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 24px;
      gap: 16px;
      color: #666;
    }

    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #f0f0f0;
      border-top: 3px solid #e74c3c;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Wishlists Container */
    .wishlists-container {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }

    .wishlists-list {
      flex: 1;
      overflow-y: auto;
      max-height: 320px;
      padding: 8px 0;
    }

    /* Custom Scrollbar */
    .wishlists-list::-webkit-scrollbar {
      width: 6px;
    }

    .wishlists-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .wishlists-list::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
    }

    .wishlists-list::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.3);
    }

    /* Wishlist Item */
    .wishlist-item {
      display: flex;
      align-items: center;
      padding: 16px 24px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      gap: 16px;
    }

    .wishlist-item:hover:not(.disabled) {
      background: #fafafa;
    }

    .wishlist-item.processing {
      background: #f8f9ff;
      pointer-events: none;
    }

    .wishlist-item.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Wishlist Icon */
    .wishlist-icon {
      flex-shrink: 0;
      color: #666;
      transition: color 0.2s ease;
    }

    .wishlist-item:hover .wishlist-icon {
      color: #333;
    }

    /* Wishlist Info */
    .wishlist-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .wishlist-name {
      font-weight: 500;
      font-size: 15px;
      color: #1a1a1a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .items-count {
      font-size: 13px;
      color: #888;
    }

    /* Heart Action */
    .heart-action {
      flex-shrink: 0;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
    }

    .heart-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .heart-btn:hover {
      background: rgba(233, 30, 99, 0.1);
      transform: scale(1.1);
    }

    .heart-empty {
      color: #ccc;
      transition: all 0.3s ease;
    }

    .heart-btn:hover .heart-empty {
      color: #e74c3c;
    }

    .heart-filled {
      animation: heartPop 0.3s ease-out;
    }

    @keyframes heartPop {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    .processing-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #f0f0f0;
      border-top: 2px solid #e74c3c;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 24px;
      text-align: center;
    }

    .empty-icon {
      color: #ddd;
      margin-bottom: 16px;
    }

    .empty-text {
      font-weight: 500;
      font-size: 16px;
      color: #666;
      margin-bottom: 8px;
    }

    .empty-subtitle {
      font-size: 14px;
      color: #999;
      margin: 0;
    }

    /* Create Section */
   .create-section {
      border-top: 1px solid #f0f0f0;
      padding: 14px 18px;
      background: #fafafa;
    }

    .create-new-btn {
      background: transparent;
      color: rgb(237, 28, 35);
      border: none;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .create-new-btn:hover {
      background: rgba(237, 28, 35, 0.1);
      color: rgb(200, 20, 30);
    }

    /* Create Form */
    .create-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    // Update these styles in your component:

    /* Input Group - WITH PLUS ICON */
    .input-group {
      position: relative;
      display: flex;
      align-items: center;
    }

    .create-input {
      width: 100%;
      padding: 10px 45px 10px 12px; /* Add right padding for plus button */
      border: 1px solid #e5e5e5;
      border-radius: 6px;
      font-size: 13px;
      transition: all 0.2s ease;
      box-sizing: border-box;
      background: white;
    }

    .create-input:focus {
      outline: none;
      border-color: rgb(237, 28, 35);
      box-shadow: 0 0 0 2px rgba(237, 28, 35, 0.1);
    }

    .create-input:disabled {
      background: #f8f8f8;
      cursor: not-allowed;
      color: #999;
    }

    /* Plus Button Inside Input */
    .plus-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: rgb(237, 28, 35);
      color: white;
      border: none;
      width: 28px;
      height: 28px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .plus-btn:hover:not(:disabled) {
      background: rgb(200, 20, 30);
      transform: translateY(-50%) scale(1.05);
    }

    .plus-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: translateY(-50%);
    }

    .plus-btn svg {
      transition: transform 0.2s ease;
    }

    .plus-btn:hover:not(:disabled) svg {
      transform: rotate(90deg);
    }

    /* Remove form-actions styles since we don't need them anymore */
    /* Delete or comment out these styles:
    .form-actions {
      display: flex;
      gap: 8px;
    }

    .create-btn, .cancel-btn {
      // ... all these styles can be removed
    }

    .cancel-btn {
      // ... remove these styles too
    }
    */

    .btn-spinner {
      width: 12px;
      height: 12px;
      border: 2px solid transparent;
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    /* Responsive adjustments */
    @media (max-width: 480px) {
      .create-section {
        padding: 12px 16px;
      }
      
      .create-input {
        padding: 9px 40px 9px 11px; /* Adjust for smaller plus button */
        font-size: 12px;
      }
      
      .plus-btn {
        width: 24px;
        height: 24px;
        right: 6px;
      }
      
      .plus-btn svg {
        width: 14px;
        height: 14px;
      }
    }

    .btn-spinner {
      width: 12px;
      height: 12px;
      border: 2px solid transparent;
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    /* Responsive Design */
    @media (max-width: 480px) {
      .wishlist-dropdown {
        width: 90vw;
        max-width: 380px;
        margin: 20px;
      }
      
      .dropdown-header {
        padding: 16px 20px;
      }
      
      .wishlist-item {
        padding: 14px 20px;
      }
      
      .create-section {
        border-top: 1px solid #f0f0f0;
        padding: 14px 18px;
        background: #fafafa;
      }
    }
    @media (max-width: 480px) {
      .create-section {
        padding: 12px 16px;
      }
      
      .create-input {
        padding: 9px 40px 9px 11px; /* Adjust for smaller plus button */
        font-size: 12px;
      }
      
      .plus-btn {
        width: 24px;
        height: 24px;
        right: 6px;
      }
      
      .plus-btn svg {
        width: 14px;
        height: 14px;
      }
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

  constructor(private wishlistService: WishlistService) { }

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