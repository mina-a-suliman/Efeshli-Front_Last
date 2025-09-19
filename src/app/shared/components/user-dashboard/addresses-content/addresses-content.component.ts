import { Component, ViewChild, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddressPopupComponent } from '../../../../features/Address-Popup/Address-Popup.component';
import { AccountService, Address } from '../../../../core/services/Account.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-addresses-content',
  standalone: true,
  imports: [CommonModule, FormsModule, AddressPopupComponent],
  template: `
    <div class="content-area">
      <h1 class="page-title">Addresses</h1>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading addresses...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage()" class="error-state">
        <p class="error-text">{{ errorMessage() }}</p>
        <button class="retry-btn" (click)="loadAddresses()">Retry</button>
      </div>

      <!-- Address List -->
      <div *ngIf="!isLoading() && !errorMessage()" class="addresses-list">
        <div *ngFor="let address of addresses()" class="address-card">
          <div class="address-content">
            <input 
              type="radio" 
              [value]="address.addressId" 
              [checked]="address.isDefault"
              (change)="selectAddress(address.addressId)"
              class="address-radio">
            <div class="address-info">
              <div class="address-text">{{ address.location }} - {{ address.area }}</div>
              <div class="address-details">{{ address.fullAddress }}</div>
              <div class="address-floor">Floor: {{ address.floorNumber }}</div>
              <div class="address-phone">Phone: {{ address.phoneNumber }}</div>
            </div>
          </div>
          <div class="address-actions">
            <button 
              class="edit-btn"
              (click)="editAddress(address)">
              Edit Address
            </button>
            <button 
              class="remove-btn"
              (click)="removeAddress(address.addressId)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              Remove
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="addresses().length === 0" class="empty-state">
          <p>No addresses found. Add your first address below.</p>
        </div>
      </div>

      <!-- Add New Address Link -->
      <div class="add-address-link">
        <button 
          class="add-address-btn"
          (click)="openAddressPopup()"
          [disabled]="isLoading()">
          + Add new address
        </button>
      </div>
    </div>

    <!-- Address Popup Component -->
    <app-address-popup 
      #addressPopup
      [isVisible]="showPopup()"
      [editData]="editingAddress()"
      (addressAdded)="onAddressAdded($event)"
      (addressUpdated)="onAddressUpdated($event)"
      (popupClosed)="onPopupClosed()">
    </app-address-popup>
  `,
  styles: [`
    .content-area {
      max-width: 800px;
    }

    .page-title {
      font-size: 28px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 32px 0;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 0;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f4f6;
      border-top: 4px solid #dc2626;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 0;
    }

    .error-text {
      color: #dc2626;
      font-size: 16px;
      margin-bottom: 16px;
    }

    .retry-btn {
      background-color: #dc2626;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
    }

    .retry-btn:hover {
      background-color: #b91c1c;
    }

    .addresses-list {
      margin-bottom: 24px;
    }

    .address-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .address-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex: 1;
    }

    .address-radio {
      margin-top: 4px;
      width: 16px;
      height: 16px;
    }

    .address-info {
      flex: 1;
    }

    .address-text {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 4px;
    }

    .address-details {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .address-floor {
      font-size: 12px;
      color: #9ca3af;
      margin-bottom: 2px;
    }

    .address-phone {
      font-size: 12px;
      color: #9ca3af;
    }

    .address-actions {
      display: flex;
      gap: 12px;
    }

    .edit-btn {
      color: #3b82f6;
      background: none;
      border: none;
      font-size: 14px;
      cursor: pointer;
      text-decoration: underline;
    }

    .remove-btn {
      color: #111827;
      background: none;
      border: none;
      font-size: 14px;
      cursor: pointer;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .add-address-link {
      margin-top: 16px;
    }

    .add-address-btn {
      color: #3b82f6;
      font-size: 16px;
      cursor: pointer;
      text-decoration: underline;
      background: none;
      border: none;
      padding: 0;
    }

    .add-address-btn:hover:not(:disabled) {
      color: #1d4ed8;
    }

    .add-address-btn:disabled {
      color: #9ca3af;
      cursor: not-allowed;
    }

    .empty-state {
      text-align: center;
      padding: 40px 0;
      color: #6b7280;
    }
  `]
})
export class AddressesContentComponent implements OnInit, OnDestroy {
  // Signals for reactive state
  showPopup = signal(false);
  editingAddress = signal<Address | null>(null);
  
  // Service subscriptions
  private subscriptions: Subscription[] = [];

  // Reference to popup component
  @ViewChild('addressPopup') addressPopup!: AddressPopupComponent;

  constructor(private accountService: AccountService) {}

  // Getters for service state
  get addresses() { return this.accountService.userAddresses; }
  get isLoading() { return this.accountService.isLoading; }
  get errorMessage() { return this.accountService.errorMessage; }

  ngOnInit(): void {
    this.loadAddresses();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadAddresses(): void {
    const sub = this.accountService.getAddresses().subscribe({
      next: (response) => {
        if (!response.succeeded) {
          console.error('Failed to load addresses:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  openAddressPopup(): void {
    this.editingAddress.set(null);
    this.showPopup.set(true);
  }

  editAddress(address: Address): void {
    this.editingAddress.set(address);
    this.showPopup.set(true);
  }

  onAddressAdded(newAddressData: any): void {
    const createAddressDto = {
      location: newAddressData.location,
      area: newAddressData.area,
      fullAddress: newAddressData.address,
      floorNumber: parseInt(newAddressData.floorNumber) || 0,
      phoneNumber: newAddressData.phoneNumber
    };

    const sub = this.accountService.addAddress(createAddressDto).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.showPopup.set(false);
          this.editingAddress.set(null);
          console.log('Address added successfully');
        } else {
          console.error('Failed to add address:', response.message);
        }
      },
      error: (error) => {
        console.error('Error adding address:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  onAddressUpdated(updatedAddressData: any): void {
    if (!this.editingAddress()) return;

    const updateAddressDto = {
      addressId: this.editingAddress()!.addressId,
      location: updatedAddressData.location,
      area: updatedAddressData.area,
      fullAddress: updatedAddressData.address,
      floorNumber: parseInt(updatedAddressData.floorNumber) || 0,
      phoneNumber: updatedAddressData.phoneNumber
    };

    const sub = this.accountService.updateAddress(updateAddressDto).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.showPopup.set(false);
          this.editingAddress.set(null);
          console.log('Address updated successfully');
        } else {
          console.error('Failed to update address:', response.message);
        }
      },
      error: (error) => {
        console.error('Error updating address:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  onPopupClosed(): void {
    this.showPopup.set(false);
    this.editingAddress.set(null);
  }

  selectAddress(addressId: number): void {
    this.accountService.setSelectedAddress(addressId);
  }

  removeAddress(addressId: number): void {
    if (confirm('Are you sure you want to delete this address?')) {
      const sub = this.accountService.deleteAddress(addressId).subscribe({
        next: (response) => {
          if (response.succeeded) {
            console.log('Address deleted successfully');
          } else {
            console.error('Failed to delete address:', response.message);
          }
        },
        error: (error) => {
          console.error('Error deleting address:', error);
        }
      });
      this.subscriptions.push(sub);
    }
  }
}