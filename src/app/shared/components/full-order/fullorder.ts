// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, Router } from '@angular/router';
// import { Subject, takeUntil } from 'rxjs';
// import { OrderService } from '../../../core/services/order.service';
// import { Order, OrderItem, OrderStatus } from '../../../core/models/order.model';

// interface FabricOption {
//   id: string;
//   name: string;
// }

// interface WoodOption {
//   id: string;
//   name: string;
// }

// interface ColorOption {
//   id: string;
//   name: string;
//   value: string;
// }

// @Component({
//   selector: 'app-full-order',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './fullorder.html',
//   styleUrls: ['./fullorder.css']
// })
// export class fullOrderComponent implements OnInit, OnDestroy {
//   private destroy$ = new Subject<void>();
  
//   activeTab: string = 'all';
//   selectedOrder: Order | null = null;
//   orders: Order[] = [];
//   loading = false;
//   error: string | null = null;
  
//   // Product customization options
//   selectedFabric: string = 'cotton';
//   selectedWood: string = 'oak';
//   selectedColor: string = 'brown';

//   availableFabrics: FabricOption[] = [
//     { id: 'cotton', name: 'Cotton' },
//     { id: 'linen', name: 'Linen' },
//     { id: 'velvet', name: 'Velvet' },
//     { id: 'leather', name: 'Leather' }
//   ];

//   availableWoods: WoodOption[] = [
//     { id: 'oak', name: 'Oak' },
//     { id: 'pine', name: 'Pine' },
//     { id: 'mahogany', name: 'Mahogany' },
//     { id: 'birch', name: 'Birch' }
//   ];

//   availableColors: ColorOption[] = [
//     { id: 'brown', name: 'Brown', value: '#8B4513' },
//     { id: 'black', name: 'Black', value: '#000000' },
//     { id: 'white', name: 'White', value: '#FFFFFF' },
//     { id: 'gray', name: 'Gray', value: '#808080' },
//     { id: 'navy', name: 'Navy', value: '#1e3a8a' },
//     { id: 'red', name: 'Red', value: '#e74c3c' }
//   ];

//   // Mock data for demonstration - will be replaced by real data from service
//   deliveredOrder: Order = {
//     id: '1',
//     orderNumber: '#ORD-001',
//     status: OrderStatus.DELIVERED,
//     orderDate: '2024-03-22T10:00:00Z',
//     deliveryDate: '2024-03-25T14:30:00Z',
//     totalAmount: 78205,
//     itemCount: 12,
//     paymentMethod: 'Credit Card',
//     paymentStatus: 'Paid' as any,
//     shippingAddress: {
//       id: 1,
//       fullName: 'John Doe',
//       phoneNumber: '+201234567890',
//       address: '123 Main Street',
//       city: 'Cairo',
//       area: 'Dokki',
//       floorNumber: 2,
//       isDefault: true
//     },
//     items: [
//       {
//         id: 1,
//         productId: 101,
//         productName: 'Mini Vintage Chair In Plywood & Pine Wood - Upholstered',
//         productImageUrl: './assets/chir2.png',
//         quantity: 5,
//         unitPrice: 11641,
//         totalPrice: 58205
//       },
//       {
//         id: 2,
//         productId: 102,
//         productName: 'Hollow-C - Armchair With Metal Frame & Cushioned Seat',
//         productImageUrl: './assets/table1.png',
//         quantity: 1,
//         unitPrice: 3000,
//         totalPrice: 3000
//       },
//       {
//         id: 3,
//         productId: 103,
//         productName: 'Lily Jute basket with white rime',
//         productImageUrl: './assets/table2.png',
//         quantity: 2,
//         unitPrice: 3500,
//         totalPrice: 7000
//       },
//       {
//         id: 4,
//         productId: 104,
//         productName: 'Lily Jute basket with white rime',
//         productImageUrl: './assets/table3.png',
//         quantity: 5,
//         unitPrice: 1500,
//         totalPrice: 7500
//       },
//       {
//         id: 5,
//         productId: 105,
//         productName: 'Lily Jute basket with white rime',
//         productImageUrl: './assets/decor.png',
//         quantity: 5,
//         unitPrice: 500,
//         totalPrice: 2500
//       }
//     ]
//   };

//   pendingOrder: Order = {
//     id: '2',
//     orderNumber: '#ORD-002',
//     status: OrderStatus.PENDING,
//     orderDate: '2024-03-20T10:00:00Z',
//     totalAmount: 63705,
//     itemCount: 7,
//     paymentMethod: 'Credit Card',
//     paymentStatus: 'Paid' as any,
//     shippingAddress: {
//       id: 1,
//       fullName: 'John Doe',
//       phoneNumber: '+201234567890',
//       address: '123 Main Street',
//       city: 'Cairo',
//       area: 'Dokki',
//       floorNumber: 2,
//       isDefault: true
//     },
//     items: [
//       {
//         id: 6,
//         productId: 101,
//         productName: 'Mini Vintage Chair In Plywood & Pine Wood - Upholstered',
//         productImageUrl: './assets/chir2.png',
//         quantity: 5,
//         unitPrice: 11641,
//         totalPrice: 58205
//       },
//       {
//         id: 7,
//         productId: 102,
//         productName: 'Hollow-C - Armchair With Metal Frame & Cushioned Seat',
//         productImageUrl: './assets/table1.png',
//         quantity: 1,
//         unitPrice: 3000,
//         totalPrice: 3000
//       },
//       {
//         id: 8,
//         productId: 105,
//         productName: 'Lily Jute basket with white rime',
//         productImageUrl: './assets/decor.png',
//         quantity: 5,
//         unitPrice: 500,
//         totalPrice: 2500
//       }
//     ]
//   };

//   constructor(
//     private orderService: OrderService,
//     private route: ActivatedRoute,
//     private router: Router
//   ) { }

//   ngOnInit(): void {
//     this.loadOrders();
    
//     // Subscribe to orders updates
//     this.orderService.orders$
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(orders => {
//         this.orders = orders;
//         if (orders.length > 0 && !this.selectedOrder) {
//           this.selectedOrder = orders[0];
//         }
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

//   setActiveTab(tab: string): void {
//     this.activeTab = tab;
    
//     // Filter orders based on tab
//     let filteredOrders: Order[] = [];
    
//     switch (tab) {
//       case 'delivered':
//         filteredOrders = this.orders.filter(order => order.status === OrderStatus.DELIVERED);
//         break;
//       case 'pending':
//         filteredOrders = this.orders.filter(order => order.status === OrderStatus.PENDING);
//         break;
//       default:
//         filteredOrders = this.orders;
//     }
    
//     if (filteredOrders.length > 0) {
//       this.selectedOrder = filteredOrders[0];
//     } else {
//       this.selectedOrder = null;
//     }
//   }

//   selectOrder(order: Order): void {
//     this.selectedOrder = order;
//   }

//   onDetailsClick(order: Order): void {
//     this.selectOrder(order);
//   }

//   // Product customization methods
//   selectFabric(fabricId: string): void {
//     this.selectedFabric = fabricId;
//     console.log('Selected Fabric:', fabricId);
//     // Add your logic here to handle fabric selection
//   }

//   selectWood(woodId: string): void {
//     this.selectedWood = woodId;
//     console.log('Selected Wood:', woodId);
//     // Add your logic here to handle wood selection
//   }

//   selectColor(colorId: string): void {
//     this.selectedColor = colorId;
//     console.log('Selected Color:', colorId);
//     // Add your logic here to handle color selection
//   }

//   // Navigation methods
//   navigateToProfile(): void {
//     this.router.navigate(['/profile']);
//   }

//   navigateToAddresses(): void {
//     this.router.navigate(['/addresses']);
//   }

//   navigateToTransactions(): void {
//     this.router.navigate(['/transactions']);
//   }

//   navigateToReferral(): void {
//     this.router.navigate(['/referral']);
//   }

//   signOut(): void {
//     this.router.navigate(['/login']);
//   }

//   // Order actions
//   cancelOrder(order: Order): void {
//     if (confirm('Are you sure you want to cancel this order?')) {
//       this.orderService.cancelOrder(order.id, 'Cancelled by user').subscribe();
//     }
//   }

//   trackOrder(order: Order): void {
//     this.router.navigate(['/orders', order.id, 'tracking']);
//   }

//   refreshOrders(): void {
//     this.orderService.refreshOrders();
//   }
// }