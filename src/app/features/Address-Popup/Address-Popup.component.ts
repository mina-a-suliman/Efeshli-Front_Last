import { Component, signal, computed, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface CountryCode {
  code: string;
  flag: string;
  country: string;
}

interface DropdownState {
  location: boolean;
  area: boolean;
  floor: boolean;
  country: boolean;
}

type DropdownKey = keyof DropdownState;

@Component({
  selector: 'app-address-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <!-- Popup Overlay -->
      <div 
        class="overlay"
        [class.show]="isOpen()"
        (click)="closePopup()"
      >
        <!-- Popup Content -->
        <div 
          class="popup-content"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="popup-header">
            <h2 class="popup-title">{{ editData ? 'Edit address' : 'Add new address' }}</h2>
            <button 
              type="button" 
              class="close-btn"
              (click)="closePopup()"
            >
              ×
            </button>
          </div>

          <!-- Form -->
          <form [formGroup]="addressForm" (ngSubmit)="onSubmit()" class="popup-form">
            <!-- Location -->
            <div class="form-group">
              <label class="form-label">Location</label>
              <div class="dropdown-container">
                <button
                  type="button"
                  class="dropdown-btn"
                  (click)="toggleDropdown('location')"
                >
                  {{ addressForm.get('location')?.value || 'Select location' }}
                  <span class="dropdown-arrow" [class.rotate]="dropdowns().location">▼</span>
                </button>
                <div class="dropdown-menu" [class.show]="dropdowns().location">
                  <div 
                    *ngFor="let location of locations"
                    class="dropdown-item"
                    (click)="selectOption('location', location)"
                  >
                    {{ location }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Area -->
            <div class="form-group">
              <label class="form-label">Areas</label>
              <div class="dropdown-container">
                <button
                  type="button"
                  class="dropdown-btn"
                  (click)="toggleDropdown('area')"
                >
                  {{ addressForm.get('area')?.value || 'Select an area' }}
                  <span class="dropdown-arrow" [class.rotate]="dropdowns().area">▼</span>
                </button>
                <div class="dropdown-menu" [class.show]="dropdowns().area">
                  <div 
                    *ngFor="let area of areas"
                    class="dropdown-item"
                    (click)="selectOption('area', area)"
                  >
                    {{ area }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Address -->
            <div class="form-group">
              <label class="form-label">Address</label>
              <input
                type="text"
                class="form-input"
                placeholder="Enter your address"
                formControlName="address"
              >
            </div>

            <!-- Floor Number -->
            <div class="form-group">
              <label class="form-label">Floor number</label>
              <div class="dropdown-container">
                <button
                  type="button"
                  class="dropdown-btn"
                  (click)="toggleDropdown('floor')"
                >
                  {{ addressForm.get('floorNumber')?.value || 'Select your floor number' }}
                  <span class="dropdown-arrow" [class.rotate]="dropdowns().floor">▼</span>
                </button>
                <div class="dropdown-menu" [class.show]="dropdowns().floor">
                  <div 
                    *ngFor="let floor of floors"
                    class="dropdown-item"
                    (click)="selectOption('floorNumber', floor)"
                  >
                    {{ floor }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Phone Number -->
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <div class="phone-container">
                <div class="dropdown-container country-code">
                  <button
                    type="button"
                    class="dropdown-btn country-btn"
                    (click)="toggleDropdown('country')"
                  >
                    {{ selectedCountry().flag }} {{ selectedCountry().code }}
                    <span class="dropdown-arrow" [class.rotate]="dropdowns().country">▼</span>
                  </button>
                  <div class="dropdown-menu country-menu" [class.show]="dropdowns().country">
                    <div 
                      *ngFor="let country of countryCodes"
                      class="dropdown-item country-item"
                      (click)="selectCountry(country)"
                    >
                      {{ country.flag }} {{ country.code }}
                    </div>
                  </div>
                </div>
                <input
                  type="tel"
                  class="form-input phone-input"
                  placeholder="Ex. 01123456789"
                  formControlName="phoneNumber"
                >
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="submit-btn"
              [disabled]="addressForm.invalid"
            >
              {{ editData ? 'Update address' : 'Add new address' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      position: relative;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 1000;
    }

    .overlay.show {
      opacity: 1;
      visibility: visible;
    }

    .popup-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      transform: scale(0.9);
      transition: transform 0.3s ease;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .overlay.show .popup-content {
      transform: scale(1);
    }

    .popup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 24px 0 24px;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 24px;
    }

    .popup-title {
      font-size: 24px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      color: #6b7280;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .close-btn:hover {
      background-color: #f3f4f6;
    }

    .popup-form {
      padding: 0 24px 24px 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: #dc2626;
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }

    .dropdown-container {
      position: relative;
    }

    .dropdown-btn {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 16px;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-align: left;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
    }

    .dropdown-btn:hover {
      border-color: #9ca3af;
    }

    .dropdown-arrow {
      font-size: 12px;
      color: #6b7280;
      transition: transform 0.2s ease;
    }

    .dropdown-arrow.rotate {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      margin-top: 4px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 10;
      max-height: 200px;
      overflow-y: auto;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition: all 0.2s ease;
    }

    .dropdown-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-item {
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      font-size: 16px;
    }

    .dropdown-item:hover {
      background-color: #f3f4f6;
    }

    .phone-container {
      display: flex;
      gap: 8px;
    }

    .country-code {
      flex: 0 0 120px;
    }

    .country-btn {
      padding: 12px 8px;
      font-size: 14px;
      min-width: 120px;
    }

    .country-menu {
      min-width: 160px;
    }

    .country-item {
      font-size: 14px;
    }

    .phone-input {
      flex: 1;
    }

    .submit-btn {
      width: 100%;
      background-color: #dc2626;
      color: white;
      padding: 16px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease;
      margin-top: 12px;
    }

    .submit-btn:hover:not(:disabled) {
      background-color: #b91c1c;
    }

    .submit-btn:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }

    @media (max-width: 640px) {
      .popup-content {
        width: 95%;
        margin: 20px;
      }

      .phone-container {
        flex-direction: column;
      }

      .country-code {
        flex: none;
      }
    }
  `]
})
export class AddressPopupComponent implements OnChanges {
  @Input() isVisible: boolean = false; // Allow external control
  @Input() editData: any = null; // For editing existing addresses
  @Output() addressAdded = new EventEmitter<any>(); // Emit when address is added
  @Output() addressUpdated = new EventEmitter<any>(); // Emit when address is updated
  @Output() popupClosed = new EventEmitter<void>(); // Emit when popup is closed

  isOpen = signal(false);
  
  dropdowns = signal<DropdownState>({
    location: false,
    area: false,
    floor: false,
    country: false
  });

  locations = ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan', 'Qena', 'Sohag'];
  areas = ['New Cairo', 'Maadi', 'Zamalek', 'Heliopolis', 'Nasr City', 'Downtown'];
  floors = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor+'];
  
  countryCodes: CountryCode[] = [
    { code: '+20', flag: '🇪🇬', country: 'Egypt' },
    { code: '+1', flag: '🇺🇸', country: 'USA' },
    { code: '+44', flag: '🇬🇧', country: 'UK' },
    { code: '+971', flag: '🇦🇪', country: 'UAE' },
    { code: '+966', flag: '🇸🇦', country: 'Saudi Arabia' }
  ];

  selectedCountryCode = signal('+20');

  selectedCountry = computed(() => {
    return this.countryCodes.find(c => c.code === this.selectedCountryCode()) || this.countryCodes[0];
  });

  addressForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.addressForm = this.fb.group({
      location: ['Cairo', Validators.required],
      area: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(5)]],
      floorNumber: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible']) {
      this.isOpen.set(this.isVisible);
    }
    
    if (changes['editData'] && this.editData) {
      // Populate form with existing data for editing
      this.addressForm.patchValue({
        location: this.editData.location || 'Cairo',
        area: this.editData.area || '',
        address: this.editData.fullAddress || '',
        floorNumber: this.editData.floorNumber?.toString() || '',
        phoneNumber: this.editData.phoneNumber || ''
      });
      
      // Update country code if available
      if (this.editData.countryCode) {
        this.selectedCountryCode.set(this.editData.countryCode);
      }
    }
  }

  togglePopup(): void {
    this.isOpen.set(!this.isOpen());
    if (!this.isOpen()) {
      this.closeAllDropdowns();
    }
  }

  closePopup(): void {
    this.isOpen.set(false);
    this.closeAllDropdowns();
    this.popupClosed.emit();
  }

  toggleDropdown(dropdown: DropdownKey): void {
    const current = this.dropdowns();
    // Close all other dropdowns
    const newState = Object.keys(current).reduce((acc, key) => ({
      ...acc,
      [key]: key === dropdown ? !current[key as DropdownKey] : false
    }), {} as DropdownState);
    
    this.dropdowns.set(newState);
  }

  closeAllDropdowns(): void {
    this.dropdowns.set({
      location: false,
      area: false,
      floor: false,
      country: false
    });
  }

  selectOption(field: string, value: string): void {
    this.addressForm.patchValue({ [field]: value });
    this.closeAllDropdowns();
  }

  selectCountry(country: CountryCode): void {
    this.selectedCountryCode.set(country.code);
    this.closeAllDropdowns();
  }

  // onSubmit(): void {
  //   if (this.addressForm.valid) {
  //     const formData = {
  //       location: this.addressForm.value.location,
  //       area: this.addressForm.value.area,
  //       address: this.addressForm.value.address,
  //       floorNumber: this.addressForm.value.floorNumber,
  //       phoneNumber: this.addressForm.value.phoneNumber,
  //       countryCode: this.selectedCountryCode()
  //     };
      
  //     console.log('Address submitted:', formData);
      
  //     // Emit the appropriate event based on whether we're editing or adding
  //     if (this.editData) {
  //       this.addressUpdated.emit(formData);
  //     } else {
  //       this.addressAdded.emit(formData);
  //     }
      
  //     // Close popup and reset form
  //     this.closePopup();
  //     this.resetForm();
  //   }
  // }
onSubmit(): void {
  if (this.addressForm.valid) {
    const formData = {
      location: this.addressForm.value.location,
      area: this.addressForm.value.area,
      address: this.addressForm.value.address,
      floorNumber: this.addressForm.value.floorNumber,
      phoneNumber: this.addressForm.value.phoneNumber,
      countryCode: this.selectedCountryCode()
    };

    // ✅ Only emit to parent, don't call API here
    if (this.editData) {
      this.addressUpdated.emit(formData);
    } else {
      this.addressAdded.emit(formData);
    }

    this.closePopup();
    this.resetForm();
  }
}
  resetForm(): void {
    this.addressForm.reset({
      location: 'Cairo',
      area: '',
      address: '',
      floorNumber: '',
      phoneNumber: ''
    });
    this.selectedCountryCode.set('+20');
    this.editData = null;
  }
}