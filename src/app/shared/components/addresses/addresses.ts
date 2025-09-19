import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Address {
  id: number;
  city: string;
  country: string;
  area: string;
  isSelected: boolean;
}

export interface AddressForm {
  city: string;
  country: string;
  area: string;
}

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addresses.html',
  styleUrls: ['./addresses.css']
})
export class AddressesComponent {
  addresses: Address[] = [
    { 
      id: 1, 
      city: 'Cairo', 
      country: 'Egypt', 
      area: 'Qena', 
      isSelected: false
    },
    { 
      id: 2, 
      city: 'Cairo', 
      country: 'Egypt', 
      area: 'Qena', 
      isSelected: false
    }
  ];

  isAddingNew: boolean = false;
  editingAddress: Address | null = null;
  
  addressForm: AddressForm = {
    city: '',
    country: '',
    area: ''
  };

  startAddNew(): void {
    this.isAddingNew = true;
    this.editingAddress = null;
    this.resetForm();
  }

  startEdit(address: Address): void {
    this.editingAddress = { ...address };
    this.isAddingNew = false;
    this.addressForm = {
      city: address.city,
      country: address.country,
      area: address.area
    };
  }

  saveAddress(): void {
    if (!this.isFormValid()) {
      return;
    }

    if (this.editingAddress) {
      this.updateExistingAddress();
    } else {
      this.addNewAddress();
    }

    this.cancelForm();
  }

  removeAddress(id: number): void {
    const addressToRemove = this.addresses.find(addr => addr.id === id);
    
    if (!addressToRemove) {
      return;
    }

    this.addresses = this.addresses.filter(addr => addr.id !== id);
    
    if (addressToRemove.isSelected) {
      this.addresses = this.addresses.map(addr => ({ ...addr, isSelected: false }));
    }
  }

  selectAddress(id: number): void {
  const currentlySelected = this.addresses.find(addr => addr.isSelected);
  if (currentlySelected && currentlySelected.id === id) {
    // لو نفس العنوان اتضغط عليه، شيل الاختيار
    this.addresses = this.addresses.map(addr => ({
      ...addr,
      isSelected: false
    }));
  } else {
    // اختار العنوان الجديد
    this.addresses = this.addresses.map(addr => ({
      ...addr,
      isSelected: addr.id === id
    }));
  }
}

  cancelForm(): void {
    this.isAddingNew = false;
    this.editingAddress = null;
    this.resetForm();
  }

  private resetForm(): void {
    this.addressForm = {
      city: '',
      country: '',
      area: ''
    };
  }

  private isFormValid(): boolean {
    return !!(
      this.addressForm.city.trim() && 
      this.addressForm.country.trim() && 
      this.addressForm.area.trim()
    );
  }

  private updateExistingAddress(): void {
    if (!this.editingAddress) return;

    const index = this.addresses.findIndex(addr => addr.id === this.editingAddress!.id);
    
    if (index !== -1) {
      this.addresses[index] = {
        ...this.addresses[index],
        city: this.addressForm.city.trim(),
        country: this.addressForm.country.trim(),
        area: this.addressForm.area.trim()
      };
    }
  }

  private addNewAddress(): void {
    const newId = this.generateNewId();
    
    const newAddress: Address = {
      id: newId,
      city: this.addressForm.city.trim(),
      country: this.addressForm.country.trim(),
      area: this.addressForm.area.trim(),
      isSelected: false
    };
    
    this.addresses.push(newAddress);
  }

  private generateNewId(): number {
    if (this.addresses.length === 0) {
      return 1;
    }
    return Math.max(...this.addresses.map(addr => addr.id)) + 1;
  }

  getSelectedAddress(): Address | null {
    return this.addresses.find(addr => addr.isSelected) || null;
  }

  signOut() {
    console.log('Sign out');
  }

  hasAddresses(): boolean {
    return this.addresses.length > 0;
  }
}