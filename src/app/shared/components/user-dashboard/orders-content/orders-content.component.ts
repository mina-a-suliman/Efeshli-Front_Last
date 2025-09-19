// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { Subject, takeUntil } from 'rxjs';
// import { OrderService } from '../../../../core/services/order.service';
// import { Order, OrderStatus } from '../../../../core/models/order.model';

// @Component({
//   selector: 'app-orders-content',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="orders-content">
//       <h1 class="page-title">Orders</h1>
      
//       <!-- Loading State -->
//       <div *ngIf="loading" class="loading-state">
//         <div class="loading-spinner"></div>
//         <p>Loading your orders...</p>
//       </div>

//       <!-- Error State -->
//       <div *ngIf="error && !loading" class="error-state">
//         <div class="error-icon">⚠️</div>
//         <h2 class="error-text">{{ error }}</h2>
//         <button class="retry-btn" (click)="refreshOrders()">Try Again</button>
//       </div>

//       <!-- Orders List -->
//       <div *ngIf="!loading && !error && orders.length > 0" class="orders-list">
//         <div class="orders-tabs">
//           <button 
//             class="tab-btn" 
//             [class.active]="activeTab === 'all'"
//             (click)="setActiveTab('all')">
//             All Orders ({{ orders.length }})
//           </button>
//           <button 
//             class="tab-btn" 
//             [class.active]="activeTab === 'pending'"
//             (click)="setActiveTab('pending')">
//             Pending ({{ getOrdersByStatus(OrderStatus.PENDING).length }})
//           </button>
//           <button 
//             class="tab-btn" 
//             [class.active]="activeTab === 'delivered'"
//             (click)="setActiveTab('delivered')">
//             Delivered ({{ getOrdersByStatus(OrderStatus.DELIVERED).length }})
//           </button>
//         </div>

//         <div class="orders-grid">
//           <div 
//             *ngFor="let order of getFilteredOrders()" 
//             class="order-card"
//             (click)="viewOrderDetails(order)">
//             <div class="order-header">
//               <h3 class="order-number">{{ order.orderNumber }}</h3>
//               <span class="order-status" [ngClass]="getStatusClass(order.status)">
//                 {{ order.status }}
//               </span>
//             </div>
//             <div class="order-details">
//               <p class="order-date">{{ order.orderDate | date:'medium' }}</p>
//               <p class="order-total">{{ order.totalAmount | currency:'EGP' }}</p>
//               <p class="order-items">{{ order.itemCount }} item(s)</p>
//             </div>
//             <div class="order-actions">
//               <button class="action-btn primary" (click)="viewOrderDetails(order); $event.stopPropagation()">
//                 View Details
//               </button>
//               <button 
//                 *ngIf="order.status === OrderStatus.PENDING" 
//                 class="action-btn secondary" 
//                 (click)="cancelOrder(order); $event.stopPropagation()">
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       <!-- Empty State -->
//       <div *ngIf="!loading && !error && orders.length === 0" class="empty-state">
//         <!-- Empty Orders Image -->
//         <div class="empty-orders-image">
//           <img src="./assets/Cart-Items.png" alt="No Orders" />
//         </div>

//         <!-- Text Content -->
//         <div class="empty-text">
//           <h2 class="main-text">You Don't Have Any Orders Yet</h2>
//           <p class="sub-text">What Are You Waiting For?</p>
//         </div>

//         <!-- Start Shopping Button -->
//         <button class="start-shopping-btn" (click)="startShopping()">
//           Start Shopping Now
//         </button>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .orders-content {
//       max-width: 800px;
//     }

//     .page-title {
//       font-size: 28px;
//       font-weight: 600;
//       color: #111827;
//       margin: 0 0 32px 0;
//     }

//     .empty-state {
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       justify-content: center;
//       text-align: center;
//       padding: 60px 20px;
//       background: white;
//       border-radius: 12px;
//       border: 1px solid #e5e7eb;
//     }

//     .empty-orders-image {
//       margin-bottom: 32px;
//     }

//     .empty-orders-image img {
//       width: 200px;
//       height: auto;
//       opacity: 0.7;
//     }

//     .empty-text {
//       margin-bottom: 32px;
//     }

//     .main-text {
//       font-size: 24px;
//       font-weight: 600;
//       color: #111827;
//       margin: 0 0 8px 0;
//     }

//     .sub-text {
//       font-size: 16px;
//       color: #6b7280;
//       margin: 0;
//     }

//     .start-shopping-btn {
//       background-color: #dc2626;
//       color: white;
//       border: none;
//       padding: 12px 24px;
//       border-radius: 8px;
//       font-size: 16px;
//       font-weight: 500;
//       cursor: pointer;
//       transition: background-color 0.2s ease;
//     }

//     .start-shopping-btn:hover {
//       background-color: #b91c1c;
//     }

//     /* Loading State */
//     .loading-state {
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

//     /* Error State */
//     .error-state {
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       justify-content: center;
//       padding: 60px 20px;
//       text-align: center;
//       background: white;
//       border-radius: 12px;
//       border: 1px solid #e5e7eb;
//     }

//     .error-icon {
//       font-size: 48px;
//       margin-bottom: 16px;
//     }

//     .error-text {
//       color: #dc2626;
//       margin-bottom: 24px;
//     }

//     .retry-btn {
//       background-color: #dc2626;
//       color: white;
//       border: none;
//       padding: 12px 24px;
//       border-radius: 8px;
//       font-size: 16px;
//       font-weight: 500;
//       cursor: pointer;
//       transition: background-color 0.2s ease;
//     }

//     .retry-btn:hover {
//       background-color: #b91c1c;
//     }

//     /* Orders List */
//     .orders-tabs {
//       display: flex;
//       gap: 8px;
//       margin-bottom: 24px;
//       border-bottom: 1px solid #e5e7eb;
//     }

//     .tab-btn {
//       background: none;
//       border: none;
//       padding: 12px 16px;
//       font-size: 16px;
//       font-weight: 500;
//       color: #6b7280;
//       cursor: pointer;
//       border-bottom: 2px solid transparent;
//       transition: all 0.2s ease;
//     }

//     .tab-btn:hover {
//       color: #374151;
//     }

//     .tab-btn.active {
//       color: #dc2626;
//       border-bottom-color: #dc2626;
//     }

//     .orders-grid {
//       display: grid;
//       gap: 16px;
//     }

//     .order-card {
//       background: white;
//       border: 1px solid #e5e7eb;
//       border-radius: 12px;
//       padding: 20px;
//       cursor: pointer;
//       transition: all 0.2s ease;
//     }

//     .order-card:hover {
//       border-color: #dc2626;
//       box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
//     }

//     .order-header {
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       margin-bottom: 12px;
//     }

//     .order-number {
//       font-size: 18px;
//       font-weight: 600;
//       color: #111827;
//       margin: 0;
//     }

//     .order-status {
//       padding: 4px 12px;
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

//     .status-returned {
//       background-color: #f3f4f6;
//       color: #6b7280;
//     }

//     .order-details {
//       margin-bottom: 16px;
//     }

//     .order-details p {
//       margin: 4px 0;
//       color: #6b7280;
//       font-size: 14px;
//     }

//     .order-total {
//       font-weight: 600;
//       color: #111827 !important;
//     }

//     .order-actions {
//       display: flex;
//       gap: 8px;
//     }

//     .action-btn {
//       padding: 8px 16px;
//       border-radius: 6px;
//       font-size: 14px;
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
// export class OrdersContentComponent implements OnInit, OnDestroy {
//   private destroy$ = new Subject<void>();
  
//   orders: Order[] = [];
//   loading = false;
//   error: string | null = null;
//   activeTab: 'all' | 'pending' | 'delivered' = 'all';
//   OrderStatus = OrderStatus; // Make OrderStatus available in template

//   constructor(
//     private router: Router,
//     private orderService: OrderService
//   ) {}

//   ngOnInit(): void {
//     this.loadOrders();
    
//     // Subscribe to orders updates
//     this.orderService.orders$
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(orders => {
//         this.orders = orders;
//       });

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

//   loadOrders(): void {
//     this.orderService.getOrders().subscribe();
//   }

//   setActiveTab(tab: 'all' | 'pending' | 'delivered'): void {
//     this.activeTab = tab;
//   }

//   getFilteredOrders(): Order[] {
//     switch (this.activeTab) {
//       case 'pending':
//         return this.orders.filter(order => order.status === OrderStatus.PENDING);
//       case 'delivered':
//         return this.orders.filter(order => order.status === OrderStatus.DELIVERED);
//       default:
//         return this.orders;
//     }
//   }

//   getOrdersByStatus(status: OrderStatus): Order[] {
//     return this.orders.filter(order => order.status === status);
//   }

//   getStatusClass(status: OrderStatus): string {
//     switch (status) {
//       case OrderStatus.PENDING:
//         return 'status-pending';
//       case OrderStatus.CONFIRMED:
//         return 'status-confirmed';
//       case OrderStatus.PROCESSING:
//         return 'status-processing';
//       case OrderStatus.SHIPPED:
//         return 'status-shipped';
//       case OrderStatus.DELIVERED:
//         return 'status-delivered';
//       case OrderStatus.CANCELLED:
//         return 'status-cancelled';
//       case OrderStatus.RETURNED:
//         return 'status-returned';
//       default:
//         return 'status-default';
//     }
//   }

//   viewOrderDetails(order: Order): void {
//     this.router.navigate(['/orders', order.id]);
//   }

//   cancelOrder(order: Order): void {
//     if (confirm('Are you sure you want to cancel this order?')) {
//       this.orderService.cancelOrder(order.id, 'Cancelled by user').subscribe();
//     }
//   }

//   refreshOrders(): void {
//     this.orderService.refreshOrders();
//   }
  
//   startShopping(): void {
//     this.router.navigate(['/home']);
//   }
// }
