import { Component, inject, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { AccountService, ProfileData, UpdateProfileDto } from '../../../../core/services/Account.service';

@Component({
  selector: 'app-profile-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-form">       
      <h2 class="page-title">Profile</h2>              
      
      <!-- Loading Indicator -->
      <div *ngIf="isLoading" class="loading-indicator">
        <div class="spinner"></div>
        Loading profile data...
      </div>
      
      <div *ngIf="!isLoading" class="form-content">
        <div class="form-row">         
          <div class="form-group">           
            <label for="firstName">First Name</label>           
            <input              
              type="text"              
              id="firstName"              
              [(ngModel)]="profileData.firstName"             
              class="form-input"             
              placeholder="Enter your first name"
              [disabled]="isSaving"           
            >         
          </div>         
          <div class="form-group">           
            <label for="lastName">Last Name</label>           
            <input              
              type="text"              
              id="lastName"              
              [(ngModel)]="profileData.lastName"             
              class="form-input"             
              placeholder="Enter your last name"
              [disabled]="isSaving"           
            >         
          </div>       
        </div>        

        <div class="form-row">         
          <div class="form-group">           
            <label for="email">E-mail</label>           
            <input              
              type="email"              
              id="email"              
              [(ngModel)]="profileData.email"             
              class="form-input"             
              placeholder="Enter your email"  
              readonly         
            >         
          </div>         
          <div class="form-group">   
            <label for="phone">Phone Number</label>   
            <div class="phone-input-container">     
              <span class="flag-icon">
                <img src="assets/Flag.png" alt="Egypt Flag" width="20" height="14" />
              </span>
              <select 
                class="country-code" 
                [(ngModel)]="countryCode"
                [disabled]="isSaving"
                (change)="onCountryCodeChange(countryCode)"
              >       
                <option value="+20">+20</option>       
                <option value="+1">+1</option>       
                <option value="+966">+966</option>       
                <option value="+971">+971</option>     
              </select>     
              <input        
                type="tel"        
                id="phone"        
                [(ngModel)]="profileData.phoneNumber"       
                class="phone-input"       
                placeholder="Ex: 106811435"
                [disabled]="isSaving"     
              >   
            </div> 
          </div>    
        </div>        

        <!-- Password Field -->
        <div class="form-row">   
          <div class="form-group password-group">     
            <label for="password">Password</label>     
            <input          
              type="password"          
              id="password"          
              value="••••••••••••"         
              class="form-input password-input"         
              placeholder="Enter your password"
              readonly         
            >       
            <button 
              type="button" 
              class="change-password-link" 
              (click)="onChangePassword()"
              [disabled]="isSaving">
              Change Password
            </button>     
          </div>   
          <div class="form-group"></div> 
        </div>               

        <div class="form-actions">         
          <button            
            type="button"            
            class="save-btn"            
            (click)="onSaveChanges()"
            [disabled]="isSaving || !hasChanges()"         
          >           
            {{ isSaving ? 'Saving...' : 'Save Changes' }}         
          </button>       
        </div>
      </div>     
    </div> 

    <!-- Password Change Modal -->
    <div class="modal-overlay" [class.show]="showPasswordModal" (click)="closePasswordModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Change Your Password</h3>
          <button class="close-btn" (click)="closePasswordModal()">×</button>
        </div>
        
        <div class="modal-body">
          <div class="modal-form-row">
            <div class="modal-form-group">
              <input
                type="password"
                id="newPassword"
                [(ngModel)]="passwordData.newPassword"
                class="modal-input"
                placeholder="New Password*"
              >
              <label for="newPassword">New Password*</label>
            </div>

            <div class="modal-form-group">
              <input
                type="password"
                id="confirmPassword"
                [(ngModel)]="passwordData.confirmPassword"
                class="modal-input"
                placeholder="Confirm Password*"
              >
              <label for="confirmPassword">Confirm The New Password*</label>
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="cancel-btn" (click)="closePasswordModal()">Cancel</button>
          <button class="save-password-btn" (click)="savePasswordChanges()">Save</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-form {
      max-width: 800px;
      padding-left: 80px;
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 15px 0;
    }

    .loading-indicator {
      display: flex;  
      align-items: center;
      gap: 12px;
      padding: 20px;
      color: #6b7280;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #e5e7eb;
      border-top: 2px solid #dc2626;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .form-content {
      background: white;
      border-radius: 12px;
      // padding: 32px;
      // border: 1px solid #e5e7eb;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      width: 450px;
    }

    .form-group label {
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
    }

    .form-input {
      padding: 7px 16px;
      border: 1px solid #d1d5db;
      border-radius: 2px;
      font-size: 16px;
      transition: border-color 0.2s ease;
      background: white;
    }

    .form-input:focus {
      outline: none;
      border-color: #000;
    }

    .form-input:disabled {
      background-color: #f9fafb;
      color: #6b7280;
    }

    .phone-input-container {
      display: flex;
      align-items: center;
      border: 1px solid #d1d5db;
      border-radius: 2px;
      overflow: hidden;
      background: white;
    }

    .flag-icon {
      padding: 12px 8px;
      background-color: #f9fafb;
      border-right: 1px solid #d1d5db;
      display: flex;
      align-items: center;
    }

    .country-code {
      padding: 12px 8px;
      border: none;
      background-color: #f9fafb;
      font-size: 16px;
      color: #374151;
      min-width: 80px;
      cursor: pointer;
    }

    .phone-input {
      flex: 1;
      padding: 7px 16px;
      border: none;
      font-size: 16px;
      // background: white;
    }

    .phone-input:focus {
      outline: none;
      border-color: #000;
    }

    .password-group {
      position: relative;
    }

    .password-input {
      padding-right: 140px;
    }

    .change-password-link {
      position: absolute;
      right: 12px;
      top: 70%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #3b82f6;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      // text-decoration: underline;
    }

    .change-password-link:disabled {
      color: #9ca3af;
      cursor: not-allowed;
    }

    .form-actions {
      margin-top: 32px;
      display: flex;
      justify-content: flex-end;
    }

    .save-btn {
      background-color: #C40101;
      color: white;
      border: none;
      padding: 10px 12px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .save-btn:hover:not(:disabled) {
      background-color: #b91c1c;
    }

    // .save-btn:disabled {
    //   background-color: #d1d5db;
    //   cursor: not-allowed;
    // }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .modal-overlay.show {
      opacity: 1;
      visibility: visible;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 0 24px;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 24px;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #111827;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      color: #6b7280;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-body {
      padding: 0 24px;
    }

    .modal-form-row {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .modal-form-group {
      position: relative;
    }

    .modal-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.2s ease;
    }

    .modal-input:focus {
      outline: none;
      border-color: #dc2626;
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }

    .modal-form-group label {
      position: absolute;
      top: -8px;
      left: 12px;
      background: white;
      padding: 0 4px;
      font-size: 12px;
      color: #6b7280;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid #e5e7eb;
      margin-top: 24px;
    }

    .cancel-btn {
      background: none;
      border: 1px solid #d1d5db;
      color: #374151;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
    }

    .save-password-btn {
      background-color: #dc2626;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
    }
  `]
})
export class ProfileContentComponent implements OnInit, OnDestroy, AfterViewInit {
  ngAfterViewInit(): void {
    // Implementation not needed for this component
  }
  private authService = inject(AuthService);
  private accountService = inject(AccountService);
  
  private currentUser: User | null = null;
  private subscriptions: Subscription[] = [];

  // Profile Data - initialized with empty values
  profileData: ProfileData = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  };

  countryCode: string = '+20';
  originalPhoneNumber: string = '';
  
  // Modal state
  showPasswordModal = false;
  
  // Password change form data
  passwordData = {
    newPassword: '',
    confirmPassword: ''
  };

  // Loading state
  isLoading = false;
  isSaving = false;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadProfileData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // -------------------------------
  // Profile Data Loading
  // -------------------------------
  private loadProfileData(): void {
    this.isLoading = true;
    
    const profileSub = this.accountService.getProfile().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.succeeded && response.data) {
          this.profileData = response.data;
          this.originalPhoneNumber = this.profileData.phoneNumber;
          
          // Extract country code and local number from phone number
          this.extractPhoneComponents();
        } else {
          console.error('Failed to load profile:', response.message);
          alert('Failed to load profile data. Please try again.');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading profile:', error);
        alert('Failed to load profile data. Please try again.');
      }
    });

    this.subscriptions.push(profileSub);
  }

  private extractPhoneComponents(): void {
    if (!this.profileData.phoneNumber) return;

    // Extract country code (assuming format like +201234567890)
    if (this.profileData.phoneNumber.startsWith('+20')) {
      this.countryCode = '+20';
      this.profileData.phoneNumber = this.profileData.phoneNumber.substring(3);
    } else if (this.profileData.phoneNumber.startsWith('+1')) {
      this.countryCode = '+1';
      this.profileData.phoneNumber = this.profileData.phoneNumber.substring(2);
    } else if (this.profileData.phoneNumber.startsWith('+966')) {
      this.countryCode = '+966';
      this.profileData.phoneNumber = this.profileData.phoneNumber.substring(4);
    } else if (this.profileData.phoneNumber.startsWith('+971')) {
      this.countryCode = '+971';
      this.profileData.phoneNumber = this.profileData.phoneNumber.substring(4);
    }
  }

  // -------------------------------
  // Profile Save Method
  // -------------------------------
  onSaveChanges(): void {
    if (!this.validateProfileData()) return;

    this.isSaving = true;
    
    const updateData: UpdateProfileDto = {
      firstName: this.profileData.firstName.trim(),
      lastName: this.profileData.lastName.trim(),
      phoneNumber: this.formatPhoneNumber()
    };

    const updateSub = this.accountService.updateProfile(updateData).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.succeeded) {
          alert('Profile updated successfully!');
          // Update the original phone number reference
          this.originalPhoneNumber = updateData.phoneNumber;
        } else {
          alert(`Failed to update profile: ${response.message}`);
        }
      },
      error: (error) => {
        this.isSaving = false;
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
      }
    });

    this.subscriptions.push(updateSub);
  }

  private formatPhoneNumber(): string {
    // Remove any non-digit characters from the local number
    const cleanPhone = this.profileData.phoneNumber.replace(/\D/g, '');
    return this.countryCode + cleanPhone;
  }

  // -------------------------------
  // Password Modal Controls
  // -------------------------------
  onChangePassword(): void {
    this.showPasswordModal = true;
    this.resetPasswordData();
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.resetPasswordData();
  }

  private resetPasswordData(): void {
    this.passwordData = {
      newPassword: '',
      confirmPassword: ''
    };
  }

  // -------------------------------
  // Save Password Method
  // -------------------------------
  savePasswordChanges(): void {
    if (!this.passwordData.newPassword || !this.passwordData.confirmPassword) {
      alert('Please fill in both password fields!');
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    if (this.passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    // TODO: Implement actual password change API call
    console.log('Password changed successfully');
    alert('Password changed successfully!');
    this.closePasswordModal();
  }

  // -------------------------------
  // Validation Helpers
  // -------------------------------
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidLocalPhone(phone: string): boolean {
    const phoneRegex = /^\d{8,12}$/; // Local number without country code
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  private validateProfileData(): boolean {
    if (!this.profileData.firstName?.trim()) {
      alert('First name is required!');
      return false;
    }

    if (!this.profileData.lastName?.trim()) {
      alert('Last name is required!');
      return false;
    }

    if (!this.isValidEmail(this.profileData.email)) {
      alert('Please enter a valid email address!');
      return false;
    }

    if (!this.isValidLocalPhone(this.profileData.phoneNumber)) {
      alert('Please enter a valid local phone number (8-12 digits)!');
      return false;
    }

    return true;
  }

  onCountryCodeChange(countryCode: string): void {
    this.countryCode = countryCode;
    console.log('Country code changed to:', countryCode);
  }

  // Check if profile data has changed
  hasChanges(): boolean {
    const fullPhone = this.formatPhoneNumber();
    return (
      this.profileData.firstName !== this.currentUser?.firstName ||
      this.profileData.lastName !== this.currentUser?.lastName ||
      fullPhone !== this.originalPhoneNumber
    );
  }
}
