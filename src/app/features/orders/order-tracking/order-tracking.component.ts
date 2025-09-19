// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, Router } from '@angular/router';
// import { Subject, takeUntil } from 'rxjs';
// import { OrderService } from '../../../core/services/order.service';
// import { OrderTracking, OrderStatusUpdate } from '../../../core/models/order.model';

// @Component({
//   selector: 'app-order-tracking',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="tracking-container">
//       <!-- Loading State -->
//       <div *ngIf="loading" class="loading-state">
//         <div class="loading-spinner"></div>
//         <p>Loading tracking information...</p>
//       </div>

//       <!-- Error State -->
//       <div *ngIf="error && !loading" class="error-state">
//         <div class="error-icon">⚠️</div>
//         <h2 class="error-text">{{ error }}</h2>
//         <button class="retry-btn" (click)="loadTracking()">Try Again</button>
//         <button class="back-btn" (click)="goBack()">Back to Order</button>
//       </div>

//       <!-- Tracking Information -->
//       <div *ngIf="!loading && !error && tracking" class="tracking-info">
//         <!-- Order Header -->
//         <div class="tracking-header">
//           <h1>Order Tracking</h1>
//           <p class="order-id">Order #{{ tracking.orderId }}</p>
//         </div>

//         <!-- Current Status -->
//         <div class="current-status">
//           <div class="status-card" [ngClass]="getStatusClass(tracking.status)">
//             <h3>Current Status</h3>
//             <p class="status-text">{{ tracking.status }}</p>
//             <p *ngIf="tracking.currentLocation" class="location">
//               📍 {{ tracking.currentLocation }}
//             </p>
//             <p *ngIf="tracking.estimatedDelivery" class="delivery-estimate">
//               📅 Estimated Delivery: {{ tracking.estimatedDelivery | date:'medium' }}
//             </p>
//           </div>
//         </div>

//         <!-- Status Timeline -->
//         <div class="status-timeline">
//           <h3>Order Progress</h3>
//           <div class="timeline">
//             <div 
//               *ngFor="let update of tracking.statusHistory; let i = index" 
//               class="timeline-item"
//               [ngClass]="{ 'active': i === 0, 'completed': i > 0 }">
//               <div class="timeline-marker">
//                 <div class="marker-dot"></div>
//               </div>
//               <div class="timeline-content">
//                 <div class="timeline-status">{{ update.status }}</div>
//                 <div class="timeline-time">{{ update.timestamp | date:'medium' }}</div>
//                 <div *ngIf="update.notes" class="timeline-notes">{{ update.notes }}</div>
//                 <div *ngIf="update.location" class="timeline-location">
//                   📍 {{ update.location }}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <!-- Actions -->
//         <div class="tracking-actions">
//           <button class="action-btn secondary" (click)="goBack()">Back to Order</button>
//           <button class="action-btn primary" (click)="refreshTracking()">Refresh Status</button>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .tracking-container {
//       max-width: 800px;
//       margin: 0 auto;
//       padding: 20px;
//     }

//     .loading-state, .error-state {
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       justify-content: center;
//       padding: 60px 20px;
//       text-align: center;
//     }

//     .loading-spinner {
//       width: 40px;
//       height: 40px;
//       border: 4px solid #f3f4f6;
//       border-top: 4px solid #dc2626;
//       border-radius: 50%;
//       animation: spin 1s linear infinite;
//       margin-bottom: 16px;
//     }

//     @keyframes spin {
//       0% { transform: rotate(0deg); }
//       100% { transform: rotate(360deg); }
//     }

//     .error-icon {
//       font-size: 48px;
//       margin-bottom: 16px;
//     }

//     .error-text {
//       color: #dc2626;
//       margin-bottom: 24px;
//     }

//     .retry-btn, .back-btn {
//       background-color: #dc2626;
//       color: white;
//       border: none;
//       padding: 12px 24px;
//       border-radius: 8px;
//       font-size: 16px;
//       font-weight: 500;
//       cursor: pointer;
//       margin: 8px;
//       transition: background-color 0.2s ease;
//     }

//     .retry-btn:hover, .back-btn:hover {
//       background-color: #b91c1c;
//     }

//     .tracking-info {
//       background: white;
//       border-radius: 12px;
//       border: 1px solid #e5e7eb;
//       overflow: hidden;
//     }

//     .tracking-header {
//       padding: 24px;
//       border-bottom: 1px solid #e5e7eb;
//       background: #f9fafb;
//     }

//     .tracking-header h1 {
//       font-size: 24px;
//       font-weight: 600;
//       color: #111827;
//       margin: 0 0 8px 0;
//     }

//     .order-id {
//       color: #6b7280;
//       margin: 0;
//     }

//     .current-status {
//       padding: 24px;
//       border-bottom: 1px solid #e5e7eb;
//     }

//     .status-card {
//       padding: 20px;
//       border-radius: 8px;
//       text-align: center;
//     }

//     .status-card h3 {
//       font-size: 18px;
//       font-weight: 600;
//       margin: 0 0 12px 0;
//     }

//     .status-text {
//       font-size: 24px;
//       font-weight: 700;
//       margin: 0 0 8px 0;
//     }

//     .location, .delivery-estimate {
//       font-size: 14px;
//       margin: 4px 0;
//     }

//     .status-pending {
//       background-color: #fef3c7;
//       color: #d97706;
//     }

//     .status-confirmed {
//       background-color: #dbeafe;
//       color: #2563eb;
//     }

//     .status-processing {
//       background-color: #e0e7ff;
//       color: #7c3aed;
//     }

//     .status-shipped {
//       background-color: #cffafe;
//       color: #0891b2;
//     }

//     .status-delivered {
//       background-color: #d1fae5;
//       color: #059669;
//     }

//     .status-cancelled {
//       background-color: #fee2e2;
//       color: #dc2626;
//     }

//     .status-timeline {
//       padding: 24px;
//     }

//     .status-timeline h3 {
//       font-size: 18px;
//       font-weight: 600;
//       color: #111827;
//       margin: 0 0 20px 0;
//     }

//     .timeline {
//       position: relative;
//     }

//     .timeline::before {
//       content: '';
//       position: absolute;
//       left: 20px;
//       top: 0;
//       bottom: 0;
//       width: 2px;
//       background: #e5e7eb;
//     }

//     .timeline-item {
//       position: relative;
//       margin-bottom: 24px;
//       padding-left: 60px;
//     }

//     .timeline-item:last-child {
//       margin-bottom: 0;
//     }

//     .timeline-marker {
//       position: absolute;
//       left: 0;
//       top: 0;
//       width: 40px;
//       height: 40px;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//     }

//     .marker-dot {
//       width: 20px;
//       height: 20px;
//       border-radius: 50%;
//       background: #e5e7eb;
//       border: 3px solid white;
//       box-shadow: 0 0 0 2px #e5e7eb;
//     }

//     .timeline-item.active .marker-dot {
//       background: #dc2626;
//       box-shadow: 0 0 0 2px #dc2626;
//     }

//     .timeline-item.completed .marker-dot {
//       background: #059669;
//       box-shadow: 0 0 0 2px #059669;
//     }

//     .timeline-content {
//       background: #f9fafb;
//       padding: 16px;
//       border-radius: 8px;
//       border: 1px solid #e5e7eb;
//     }

//     .timeline-status {
//       font-size: 16px;
//       font-weight: 600;
//       color: #111827;
//       margin-bottom: 4px;
//     }

//     .timeline-time {
//       font-size: 14px;
//       color: #6b7280;
//       margin-bottom: 8px;
//     }

//     .timeline-notes {
//       font-size: 14px;
//       color: #374151;
//       margin-bottom: 4px;
//     }

//     .timeline-location {
//       font-size: 14px;
//       color: #6b7280;
//     }

//     .tracking-actions {
//       display: flex;
//       gap: 12px;
//       padding: 24px;
//       justify-content: flex-end;
//     }

//     .action-btn {
//       padding: 12px 24px;
//       border-radius: 8px;
//       font-size: 16px;
//       font-weight: 500;
//       cursor: pointer;
//       transition: all 0.2s ease;
//       border: none;
//     }

//     .action-btn.primary {
//       background-color: #dc2626;
//       color: white;
//     }

//     .action-btn.primary:hover {
//       background-color: #b91c1c;
//     }

//     .action-btn.secondary {
//       background-color: #f3f4f6;
//       color: #374151;
//     }

//     .action-btn.secondary:hover {
//       background-color: #e5e7eb;
//     }
//   `]
// })
// export class OrderTrackingComponent implements OnInit, OnDestroy {
//   private destroy$ = new Subject<void>();
  
//   tracking: OrderTracking | null = null;
//   loading = false;
//   error: string | null = null;
//   orderId: string | null = null;

//   constructor(
//     private orderService: OrderService,
//     private route: ActivatedRoute,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.route.paramMap.pipe(
//       takeUntil(this.destroy$)
//     ).subscribe(params => {
//       this.orderId = params.get('id');
//       if (this.orderId) {
//         this.loadTracking();
//       }
//     });

//     // Subscribe to loading state
//     this.orderService.loading$
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(loading => {
//         this.loading = loading;
//       });

//     // Subscribe to error state
//     this.orderService.error$
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(error => {
//         this.error = error;
//       });
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   loadTracking(): void {
//     if (!this.orderId) return;
    
//     this.orderService.getOrderTracking(this.orderId).subscribe({
//       next: (response) => {
//         if (response.succeeded && response.data) {
//           this.tracking = response.data;
//         }
//       },
//       error: (error) => {
//         console.error('Error loading tracking:', error);
//       }
//     });
//   }

//   getStatusClass(status: string): string {
//     switch (status) {
//       case 'Pending':
//         return 'status-pending';
//       case 'Confirmed':
//         return 'status-confirmed';
//       case 'Processing':
//         return 'status-processing';
//       case 'Shipped':
//         return 'status-shipped';
//       case 'Delivered':
//         return 'status-delivered';
//       case 'Cancelled':
//         return 'status-cancelled';
//       case 'Returned':
//         return 'status-returned';
//       default:
//         return 'status-pending';
//     }
//   }

//   refreshTracking(): void {
//     this.loadTracking();
//   }

//   goBack(): void {
//     if (this.orderId) {
//       this.router.navigate(['/orders', this.orderId]);
//     } else {
//       this.router.navigate(['/orders']);
//     }
//   }
// }
