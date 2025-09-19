// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, Router } from '@angular/router';
// import { Subject, takeUntil } from 'rxjs';
// import { OrderService } from '../../../core/services/order.service';
// import { Order, OrderTracking } from '../../../core/models/order.model';

// @Component({
//   selector: 'app-order-details',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="order-details-container">
//       <!-- Loading State -->
//       <div *ngIf="loading" class="loading-state">
//         <div class="loading-spinner"></div>
//         <p>Loading order details...</p>
//       </div>

//       <!-- Error State -->
//       <div *ngIf="error && !loading" class="error-state">
//         <div class="error-icon">⚠️</div>
//         <h2 class="error-text">{{ error }}</h2>
//         <button class="retry-btn" (click)="loadOrder()">Try Again</button>
//         <button class="back-btn" (click)="goBack()">Back to Orders</button>
//       </div>

//       <!-- Order Details -->
//       <div *ngIf="!loading && !error && order" class="order-details">
//         <!-- Order Header -->
//         <div class="order-header">
//           <div class="order-info">
//             <h1 class="order-number">{{ order.orderNumber }}</h1>
//             <p class="order-date">Ordered on {{ order.orderDate | date:'medium' }}</p>
//           </div>
//           <div class="order-status">
//             <span class="status-badge" [ngClass]="getStatusClass(order.status)">
//               {{ order.status }}
//             </span>
//           </div>
//         </div>

//         <!-- Order Summary -->
//         <div class="order-summary">
//           <div class="summary-item">
//             <span class="label">Total Amount:</span>
//             <span class="value">{{ order.totalAmount | currency:'EGP' }}</span>
//           </div>
//           <div class="summary-item">
//             <span class="label">Items:</span>
//             <span class="value">{{ order.itemCount }}</span>
//           </div>
//           <div class="summary-item">
//             <span class="label">Payment Method:</span>
//             <span class="value">{{ order.paymentMethod }}</span>
//           </div>
//           <div class="summary-item" *ngIf="order.trackingNumber">
//             <span class="label">Tracking Number:</span>
//             <span class="value">{{ order.trackingNumber }}</span>
//           </div>
//         </div>

//         <!-- Shipping Address -->
//         <div class="shipping-address" *ngIf="order.shippingAddress">
//           <h3>Shipping Address</h3>
//           <div class="address-details">
//             <p><strong>{{ order.shippingAddress.fullName }}</strong></p>
//             <p>{{ order.shippingAddress.phoneNumber }}</p>
//             <p>{{ order.shippingAddress.address }}</p>
//             <p>{{ order.shippingAddress.area }}, {{ order.shippingAddress.city }}</p>
//             <p>Floor {{ order.shippingAddress.floorNumber }}</p>
//           </div>
//         </div>

//         <!-- Order Items -->
//         <div class="order-items">
//           <h3>Order Items</h3>
//           <div class="items-list">
//             <div *ngFor="let item of order.items" class="item-card">
//               <img [src]="item.productImageUrl" [alt]="item.productName" class="item-image">
//               <div class="item-details">
//                 <h4 class="item-name">{{ item.productName }}</h4>
//                 <div class="item-options" *ngIf="item.fabric || item.wood || item.color">
//                   <span *ngIf="item.fabric" class="option">Fabric: {{ item.fabric }}</span>
//                   <span *ngIf="item.wood" class="option">Wood: {{ item.wood }}</span>
//                   <span *ngIf="item.color" class="option">Color: {{ item.color }}</span>
//                 </div>
//                 <div class="item-quantity">Quantity: {{ item.quantity }}</div>
//               </div>
//               <div class="item-price">
//                 <span class="unit-price">{{ item.unitPrice | currency:'EGP' }}</span>
//                 <span class="total-price">{{ item.totalPrice | currency:'EGP' }}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <!-- Order Actions -->
//         <div class="order-actions">
//           <button class="action-btn secondary" (click)="goBack()">Back to Orders</button>
//           <button 
//             *ngIf="order.status === 'Pending'" 
//             class="action-btn danger" 
//             (click)="cancelOrder()">
//             Cancel Order
//           </button>
//           <button 
//             *ngIf="order.trackingNumber" 
//             class="action-btn primary" 
//             (click)="trackOrder()">
//             Track Order
//           </button>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .order-details-container {
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

//     .order-details {
//       background: white;
//       border-radius: 12px;
//       border: 1px solid #e5e7eb;
//       overflow: hidden;
//     }

//     .order-header {
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       padding: 24px;
//       border-bottom: 1px solid #e5e7eb;
//       background: #f9fafb;
//     }

//     .order-number {
//       font-size: 24px;
//       font-weight: 600;
//       color: #111827;
//       margin: 0 0 8px 0;
//     }

//     .order-date {
//       color: #6b7280;
//       margin: 0;
//     }

//     .status-badge {
//       padding: 8px 16px;
//       border-radius: 20px;
//       font-size: 14px;
//       font-weight: 500;
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

//     .order-summary {
//       padding: 24px;
//       border-bottom: 1px solid #e5e7eb;
//     }

//     .summary-item {
//       display: flex;
//       justify-content: space-between;
//       margin-bottom: 12px;
//     }

//     .summary-item:last-child {
//       margin-bottom: 0;
//     }

//     .label {
//       color: #6b7280;
//       font-weight: 500;
//     }

//     .value {
//       color: #111827;
//       font-weight: 600;
//     }

//     .shipping-address, .order-items {
//       padding: 24px;
//       border-bottom: 1px solid #e5e7eb;
//     }

//     .shipping-address:last-child, .order-items:last-child {
//       border-bottom: none;
//     }

//     .shipping-address h3, .order-items h3 {
//       font-size: 18px;
//       font-weight: 600;
//       color: #111827;
//       margin: 0 0 16px 0;
//     }

//     .address-details p {
//       margin: 4px 0;
//       color: #374151;
//     }

//     .items-list {
//       display: flex;
//       flex-direction: column;
//       gap: 16px;
//     }

//     .item-card {
//       display: flex;
//       gap: 16px;
//       padding: 16px;
//       border: 1px solid #e5e7eb;
//       border-radius: 8px;
//     }

//     .item-image {
//       width: 80px;
//       height: 80px;
//       object-fit: cover;
//       border-radius: 8px;
//     }

//     .item-details {
//       flex: 1;
//     }

//     .item-name {
//       font-size: 16px;
//       font-weight: 600;
//       color: #111827;
//       margin: 0 0 8px 0;
//     }

//     .item-options {
//       display: flex;
//       gap: 12px;
//       margin-bottom: 8px;
//     }

//     .option {
//       font-size: 14px;
//       color: #6b7280;
//       background: #f3f4f6;
//       padding: 4px 8px;
//       border-radius: 4px;
//     }

//     .item-quantity {
//       font-size: 14px;
//       color: #6b7280;
//     }

//     .item-price {
//       display: flex;
//       flex-direction: column;
//       align-items: flex-end;
//       text-align: right;
//     }

//     .unit-price {
//       font-size: 14px;
//       color: #6b7280;
//     }

//     .total-price {
//       font-size: 16px;
//       font-weight: 600;
//       color: #111827;
//     }

//     .order-actions {
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

//     .action-btn.danger {
//       background-color: #fee2e2;
//       color: #dc2626;
//     }

//     .action-btn.danger:hover {
//       background-color: #fecaca;
//     }
//   `]
// })
// export class OrderDetailsComponent implements OnInit, OnDestroy {
//   private destroy$ = new Subject<void>();
  
//   order: Order | null = null;
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
//         this.loadOrder();
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

//   loadOrder(): void {
//     if (!this.orderId) return;
    
//     this.orderService.getOrderById(this.orderId).subscribe({
//       next: (response) => {
//         if (response.succeeded && response.data) {
//           this.order = response.data;
//         }
//       },
//       error: (error) => {
//         console.error('Error loading order:', error);
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

//   cancelOrder(): void {
//     if (!this.order) return;
    
//     if (confirm('Are you sure you want to cancel this order?')) {
//       this.orderService.cancelOrder(this.order.id, 'Cancelled by user').subscribe({
//         next: () => {
//           this.loadOrder(); // Refresh order details
//         }
//       });
//     }
//   }

//   trackOrder(): void {
//     if (this.orderId) {
//       this.router.navigate(['/orders', this.orderId, 'tracking']);
//     }
//   }

//   goBack(): void {
//     this.router.navigate(['/orders']);
//   }
// }
