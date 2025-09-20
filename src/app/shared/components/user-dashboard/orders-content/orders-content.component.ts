import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { OrderService } from '../../../../core/services/order.service';
import { OrderSummary, OrderStatus, PaymentMethod, PaymentStatus } from '../../../../core/models/order.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-orders-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="orders-content">
      <h1 class="page-title">Orders</h1>
      
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="error-state">
        <div class="error-icon">⚠️</div>
        <h2 class="error-text">{{ error }}</h2>
        <button class="retry-btn" (click)="refreshOrders()">Try Again</button>
      </div>

      <!-- Orders List -->
      <div *ngIf="!loading && !error && orders.length > 0" class="orders-list">
        <div class="orders-tabs">
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'all'"
            (click)="setActiveTab('all')">
            All Orders ({{ orders.length }})
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'pending'"
            (click)="setActiveTab('pending')">
            Pending ({{ getOrdersByStatus(OrderStatus.Pending).length }})
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'delivered'"
            (click)="setActiveTab('delivered')">
            Delivered ({{ getOrdersByStatus(OrderStatus.Delivered).length }})
          </button>
        </div>

        <div class="orders-grid">
          <div 
            *ngFor="let order of getFilteredOrders()" 
            class="order-card"
            (click)="viewOrderDetails(order)">
            <div class="order-header">
              <h3 class="order-number">{{ order.orderNumber }}</h3>
              <span class="order-status" [ngClass]="getStatusClass(order.status)">
                {{ order.statusText }}
              </span>
            </div>
            <div class="order-details">
              <p class="order-date">{{ order.createdDate | date:'medium' }}</p>
              <p class="order-total">{{ order.totalDisplayText }}</p>
              <p class="order-items">{{ order.itemsCount }} item(s)</p>
              <p class="payment-method">Payment: {{ getPaymentMethodText(order.paymentMethod) }}</p>
            </div>
            <div class="order-actions">
              <button class="action-btn primary" (click)="viewOrderDetails(order); $event.stopPropagation()">
                View Details
              </button>
              <button 
                *ngIf="order.status === OrderStatus.Pending" 
                class="action-btn secondary" 
                (click)="cancelOrder(order); $event.stopPropagation()">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div *ngIf="!loading && !error && orders.length === 0" class="empty-state">
        <!-- Empty Orders Image -->
        <div class="empty-orders-image">
          <img src="./assets/Cart-Items.png" alt="No Orders" />
        </div>

        <!-- Text Content -->
        <div class="empty-text">
          <h2 class="main-text">You Don't Have Any Orders Yet</h2>
          <p class="sub-text">What Are You Waiting For?</p>
        </div>

        <!-- Start Shopping Button -->
        <button class="start-shopping-btn" (click)="startShopping()">
          Start Shopping Now
        </button>
      </div>
    </div>
  `,
  styles: [`
    .orders-content {
      max-width: 800px;
    }

    .page-title {
      font-size: 28px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 32px 0;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
    }

    .empty-orders-image {
      margin-bottom: 32px;
    }

    .empty-orders-image img {
      width: 200px;
      height: auto;
      opacity: 0.7;
    }

    .empty-text {
      margin-bottom: 32px;
    }

    .main-text {
      font-size: 24px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .sub-text {
      font-size: 16px;
      color: #6b7280;
      margin: 0;
    }

    .start-shopping-btn {
      background-color: #dc2626;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .start-shopping-btn:hover {
      background-color: #b91c1c;
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f4f6;
      border-top: 4px solid #dc2626;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Error State */
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      background: white;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
    }

    .error-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .error-text {
      color: #dc2626;
      margin-bottom: 24px;
    }

    .retry-btn {
      background-color: #dc2626;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .retry-btn:hover {
      background-color: #b91c1c;
    }

    /* Orders List */
    .orders-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .tab-btn {
      background: none;
      border: none;
      padding: 12px 16px;
      font-size: 16px;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
    }

    .tab-btn:hover {
      color: #374151;
    }

    .tab-btn.active {
      color: #dc2626;
      border-bottom-color: #dc2626;
    }

    .orders-grid {
      display: grid;
      gap: 16px;
    }

    .order-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .order-card:hover {
      border-color: #dc2626;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .order-number {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .order-status {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }

    .status-pending {
      background-color: #fef3c7;
      color: #d97706;
    }

    .status-processing {
      background-color: #e0e7ff;
      color: #7c3aed;
    }

    .status-shipped {
      background-color: #cffafe;
      color: #0891b2;
    }

    .status-delivered {
      background-color: #d1fae5;
      color: #059669;
    }

    .status-cancelled {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .order-details {
      margin-bottom: 16px;
    }

    .order-details p {
      margin: 4px 0;
      color: #6b7280;
      font-size: 14px;
    }

    .order-total {
      font-weight: 600;
      color: #111827 !important;
    }

    .order-actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }

    .action-btn.primary {
      background-color: #dc2626;
      color: white;
    }

    .action-btn.primary:hover {
      background-color: #b91c1c;
    }

    .action-btn.secondary {
      background-color: #f3f4f6;
      color: #374151;
    }

    .action-btn.secondary:hover {
      background-color: #e5e7eb;
    }
  `]
})
export class OrdersContentComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  orders: OrderSummary[] = [];
  loading = false;
  error: string | null = null;
  activeTab: 'all' | 'pending' | 'delivered' = 'all';
  OrderStatus = OrderStatus; // Make OrderStatus available in template

  constructor(
    private router: Router,
    private orderService: OrderService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;

    this.orderService.getMyOrders().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.orders = response.data;
        } else {
          this.error = response.message || 'Failed to load orders';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading orders';
        this.loading = false;
        this.toastService.showError('Error loading orders');
      }
    });
  }

  setActiveTab(tab: 'all' | 'pending' | 'delivered'): void {
    this.activeTab = tab;
  }

  getFilteredOrders(): OrderSummary[] {
    switch (this.activeTab) {
      case 'pending':
        return this.orders.filter(order => order.status === OrderStatus.Pending);
      case 'delivered':
        return this.orders.filter(order => order.status === OrderStatus.Delivered);
      default:
        return this.orders;
    }
  }

  getOrdersByStatus(status: OrderStatus): OrderSummary[] {
    return this.orders.filter(order => order.status === status);
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'status-pending';
      case OrderStatus.Processing:
        return 'status-processing';
      case OrderStatus.Shipped:
        return 'status-shipped';
      case OrderStatus.Delivered:
        return 'status-delivered';
      case OrderStatus.Cancelled:
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }

  getPaymentMethodText(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.CashOnDelivery:
        return 'Cash on Delivery';
      case PaymentMethod.CreditCard:
        return 'Credit Card';
      case PaymentMethod.PayPal:
        return 'PayPal';
      default:
        return 'Unknown';
    }
  }

  viewOrderDetails(order: OrderSummary): void {
    this.router.navigate(['/dashboard/orders', order.orderId]);
  }

  cancelOrder(order: OrderSummary): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(order.orderId).subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.toastService.showSuccess('Order cancelled successfully');
            this.loadOrders(); // Refresh the orders list
          } else {
            this.toastService.showError(response.message || 'Failed to cancel order');
          }
        },
        error: (err) => {
          this.toastService.showError('Error cancelling order');
        }
      });
    }
  }

  refreshOrders(): void {
    this.loadOrders();
  }
  
  startShopping(): void {
    this.router.navigate(['/home']);
  }
}