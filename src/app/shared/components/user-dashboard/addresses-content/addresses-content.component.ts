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
  templateUrl: './addresses-content.component.html',
  styleUrls: ['./addresses-content.component.css']
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