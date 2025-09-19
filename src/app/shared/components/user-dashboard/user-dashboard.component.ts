import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="profile-container">
      <!-- Sidebar -->
      <div class="sidebar">
        <!-- User Info -->
        <div class="user-info">
          <div class="avatar">
            <span class="avatar-initial">{{ getUserInitial() }}</span>
          </div>
          <div class="user-details">
            <h3>{{ getUserName() }}</h3>
            <button class="sign-out-btn" (click)="onSignOut()">Sign out</button>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="nav-menu">       
          <a 
            [routerLink]="['/dashboard/profile']" 
            class="nav-item" 
            [class.active]="isActiveRoute('/dashboard/profile')">         
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="nav-icon">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span>Profile</span>       
          </a>       
          <a 
            [routerLink]="['/dashboard/orders']" 
            class="nav-item"
            [class.active]="isActiveRoute('/dashboard/orders')">         
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="nav-icon">
              <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
              <path d="M9 8V17H11V8H9ZM13 8V17H15V8H13Z"/>
            </svg>
            <span>Orders</span>       
          </a>       
          <a 
            [routerLink]="['/dashboard/address']" 
            class="nav-item"
            [class.active]="isActiveRoute('/dashboard/address')">         
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="nav-icon">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              <path d="M12 6c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
            </svg>
            <span>Addresses</span>       
          </a>       
          <a class="nav-item">         
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="nav-icon">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              <path d="M8 12h8v2H8v-2z"/>
              <path d="M10 8h4v2h-4V8z"/>
            </svg>
            <span>Projects transactions</span>       
          </a>       
          <a class="nav-item">         
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="nav-icon">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Refer a friend</span>       
          </a>     
        </nav> 
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      display: flex;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .sidebar {
      width: 280px;
      background: white;
      border-right: 1px solid #e5e7eb;
      padding: 24px 0;
    }

    .user-info {
      padding: 0 24px 24px 24px;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 48px;
      height: 48px;
      background: #dc2626;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar-initial {
      color: white;
      font-weight: 600;
      font-size: 18px;
    }

    .user-details h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }

    .sign-out-btn {
      background: none;
      border: none;
      color: #6b7280;
      font-size: 14px;
      cursor: pointer;
      padding: 0;
    }

    .nav-menu {
      padding: 0 12px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #6b7280;
      text-decoration: none;
      border-radius: 8px;
      margin-bottom: 4px;
      transition: all 0.2s ease;
    }

    .nav-item .nav-icon {
      color: inherit;
    }

    .nav-item:hover {
      background-color: #f3f4f6;
      color: #111827;
    }

    .nav-item.active {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .nav-item.active .nav-icon {
      color: #dc2626;
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .main-content {
      flex: 1;
      padding: 24px;
    }
  `]
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  
  private currentUser: User | null = null;
  private subscriptions: Subscription[] = [];
  currentRoute: string = '';

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Subscribe to route changes to update active state
    const routeSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });
    
    this.subscriptions.push(routeSub);
    
    // Set initial route
    this.currentRoute = this.router.url;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getUserInitial(): string {
    if (this.currentUser?.firstName) {
      return this.currentUser.firstName.charAt(0).toUpperCase();
    }
    return 'U';
  }

  getUserName(): string {
    if (this.currentUser?.firstName && this.currentUser?.lastName) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return 'User';
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute === route;
  }

  onSignOut(): void {
    const confirmSignOut = window.confirm('Are you sure you want to sign out?');
    if (confirmSignOut) {
      this.authService.logout();
    }
  }
}
