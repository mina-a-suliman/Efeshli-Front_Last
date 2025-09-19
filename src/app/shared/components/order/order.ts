// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, Router } from '@angular/router';
// import { Subject, takeUntil } from 'rxjs';
// import { OrderService } from '../../../core/services/order.service';
// import { AuthService } from '../../../core/services/auth.service';
// import { Order, OrderStatus } from '../../../core/models/order.model';

// @Component({
//   selector: 'app-order',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   templateUrl: './order.html',
//   styleUrls: ['./order.css']
// })
// export class OrdersComponent implements OnInit, OnDestroy {
//   private destroy$ = new Subject<void>();
  
//   orders: Order[] = [];
//   loading = false;
//   error: string | null = null;
//   activeTab: 'all' | 'pending' | 'delivered' | 'cancelled' = 'all';

//   constructor(
//     private orderService: OrderService,
//     private authService: AuthService,
//     private router: Router
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

//   setActiveTab(tab: 'all' | 'pending' | 'delivered' | 'cancelled'): void {
//     this.activeTab = tab;
    
//     switch (tab) {
//       case 'pending':
//         this.orderService.getOrdersByStatus(OrderStatus.PENDING).subscribe();
//         break;
//       case 'delivered':
//         this.orderService.getOrdersByStatus(OrderStatus.DELIVERED).subscribe();
//         break;
//       case 'cancelled':
//         this.orderService.getOrdersByStatus(OrderStatus.CANCELLED).subscribe();
//         break;
//       default:
//         this.loadOrders();
//     }
//   }

//   getFilteredOrders(): Order[] {
//     switch (this.activeTab) {
//       case 'pending':
//         return this.orders.filter(order => order.status === OrderStatus.PENDING);
//       case 'delivered':
//         return this.orders.filter(order => order.status === OrderStatus.DELIVERED);
//       case 'cancelled':
//         return this.orders.filter(order => order.status === OrderStatus.CANCELLED);
//       default:
//         return this.orders;
//     }
//   }

//   getOrderStatusClass(status: OrderStatus): string {
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

//   trackOrder(order: Order): void {
//     this.router.navigate(['/orders', order.id, 'tracking']);
//   }

//   startShopping(): void {
//     this.router.navigate(['/home']);
//   }

//   signOut(): void {
//     this.authService.logout();
//     this.router.navigate(['/login']);
//   }

//   refreshOrders(): void {
//     this.orderService.refreshOrders();
//   }
// }