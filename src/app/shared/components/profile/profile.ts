// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { AuthService, User } from '../../../core/services/auth.service';
// import { Router, RouterLink } from '@angular/router';

// @Component({
//   selector: 'app-profile',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterLink],
//   templateUrl: './profile.html',
//   styleUrls: ['./profile.css']
// })
// export class ProfileComponent {
//   // Profile Data
//   profileData = {
//     firstName: 'Omnya',
//     lastName: 'Ahmed',
//     email: 'omnyaahmed959@gmail.com',
//     phone: '20106811435',
//     countryCode: '+20'
//   };

// private currentUser:User|null;

// constructor(private router:Router,private authService:AuthService){
//    this.currentUser= this.authService.getCurrentUser();

// }
// onActionClick(action: string) {
//   if (action === 'logout') {
//   this.authService.logout();

//   } else {
//     this.router.navigate([`/${action}`]);
//   }
// }
//   // Modal state
//   showPasswordModal = false;
  
//   // Password change form data
//   passwordData = {
//     newPassword: '',
//     confirmPassword: ''
//   };

//   // -------------------------------
//   // Profile Save Method
//   // -------------------------------
//   onSaveChanges(): void {
//     if (!this.validateProfileData()) return;

//     console.log('Profile data saved:', this.profileData);
//     alert('Profile changes saved successfully!');
//   }

//   // -------------------------------
//   // Password Modal Controls
//   // -------------------------------
//   onChangePassword(): void {
//     console.log("Change password clicked ✅");
//     this.showPasswordModal = true;
//     this.resetPasswordData();
//   }

//   closePasswordModal(): void {
//     this.showPasswordModal = false;
//     this.resetPasswordData();
//   }

//   private resetPasswordData(): void {
//     this.passwordData = {
//       newPassword: '',
//       confirmPassword: ''
//     };
//   }

//   // -------------------------------
//   // Save Password Method
//   // -------------------------------
//   savePasswordChanges(): void {
//     if (!this.passwordData.newPassword || !this.passwordData.confirmPassword) {
//       alert('Please fill in both password fields!');
//       return;
//     }

//     if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
//       alert('Passwords do not match!');
//       return;
//     }
    
//     if (this.passwordData.newPassword.length < 6) {
//       alert('Password must be at least 6 characters long!');
//       return;
//     }

//     console.log('Password changed successfully');
//     alert('Password changed successfully!');
//     this.closePasswordModal();
//   }

//   // -------------------------------
//   // Sign Out Method
//   // -------------------------------
//   onSignOut(): void {
//     const confirmSignOut = window.confirm('Are you sure you want to sign out?');
//     if (confirmSignOut) {
     
//     }
//   }

//   // -------------------------------
//   // Helpers
//   // -------------------------------
//   private isValidEmail(email: string): boolean {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   }

//   private isValidPhone(phone: string): boolean {
//     const phoneRegex = /^\d{10,15}$/;
//     return phoneRegex.test(phone);
//   }

//   private validateProfileData(): boolean {
//     if (!this.profileData.firstName.trim()) {
//       alert('First name is required!');
//       return false;
//     }

//     if (!this.profileData.lastName.trim()) {
//       alert('Last name is required!');
//       return false;
//     }

//     if (!this.isValidEmail(this.profileData.email)) {
//       alert('Please enter a valid email address!');
//       return false;
//     }

//     if (!this.isValidPhone(this.profileData.phone)) {
//       alert('Please enter a valid phone number (10-15 digits)!');
//       return false;
//     }

//     return true;
//   }

//   onInputChange(field: string, value: string): void {
//     console.log(`Field ${field} changed to: ${value}`);
//   }

//   onCountryCodeChange(countryCode: string): void {
//     this.profileData.countryCode = countryCode;
//     console.log('Country code changed to:', countryCode);
//   }
// }




import { Component, inject, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { AccountService, ProfileData, UpdateProfileDto } from '../../../core/services/Account.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit, OnDestroy, AfterViewInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute); // Add this
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

  constructor() {
    console.log('ProfileComponent constructor called');
  }

  ngOnInit(): void {
    console.log('ProfileComponent ngOnInit called');
    console.log('Current route:', window.location.href);

    this.currentUser = this.authService.getCurrentUser();
    console.log('Current user:', this.currentUser);
    
    this.loadProfileData();
  }

  ngAfterViewInit(): void {
    console.log('ProfileComponent ngAfterViewInit called');
  }

  ngOnDestroy(): void {
    console.log('ProfileComponent ngOnDestroy called');
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onActionClick(action: string): void {
    if (action === 'logout') {
      this.authService.logout();
    } else {
      this.router.navigate([`/${action}`]);
    }
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
  // Sign Out Method
  // -------------------------------
  onSignOut(): void {
    const confirmSignOut = window.confirm('Are you sure you want to sign out?');
    if (confirmSignOut) {
      this.authService.logout();
    }
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