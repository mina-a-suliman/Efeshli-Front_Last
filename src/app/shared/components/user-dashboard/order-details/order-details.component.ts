import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../../core/services/order.service';
import { OrderDetails, OrderStatus, PaymentMethod, PaymentStatus } from '../../../../core/models/order.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="order-details-container">
      <!-- Back Button -->
      <button class="back-btn" (click)="goBack()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Back to Orders
      </button>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="error-state">
        <div class="error-icon">⚠️</div>
        <h2 class="error-text">{{ error }}</h2>
        <button class="retry-btn" (click)="loadOrderDetails()">Try Again</button>
      </div>

      <!-- Order Details -->
      <div *ngIf="!loading && !error && order" class="order-details">
        <!-- Order Header -->
        <div class="order-header">
          <div class="order-info">
            <h1 class="order-number">{{ order.orderNumber }}</h1>
            <p class="order-date">Ordered on {{ order.orderDateDisplay }}</p>
          </div>
          <div class="order-status">
            <span class="status-badge" [ngClass]="getStatusClass(order.status)">
              <!-- <span class="status-icon">{{ getStatusIcon(order.status) }}</span> -->
              {{ getStatusText(order.status) }}
            </span>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="order-summary">
          <div class="summary-card">
            <h3>Order Summary</h3>
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>{{ order.subTotalPrice | currency:'EGP' }}</span>
            </div>
            <div class="summary-row" *ngIf="order.discountValue">
              <span>Discount:</span>
              <span class="discount">-{{ order.discountValue | currency:'EGP' }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping:</span>
              <span>{{ order.shippingPrice | currency:'EGP' }}</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>{{ order.totalPrice | currency:'EGP' }}</span>
            </div>
          </div>

          <div class="payment-card">
            <h3>Payment Information</h3>
            <div class="payment-row">
              <span>Method:</span>
              <span>{{ order.paymentMethodText }}</span>
            </div>
            <div class="payment-row">
              <span>Status:</span>
              <span [ngClass]="getPaymentStatusClass(order.paymentStatus)">
                {{ order.paymentStatusText }}
              </span>
            </div>
            <div class="payment-row" *ngIf="order.transactionId">
              <span>Transaction ID:</span>
              <span class="transaction-id">{{ order.transactionId }}</span>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="order-items">
          <h3>Order Items ({{ order.numberOfProducts }})</h3>
          <div class="items-list">
            <div *ngFor="let item of order.orderItems" class="item-card">
              <div class="item-image">
                <img [src]="item.productImage || './assets/imgi_39_default.png'" [alt]="item.productName" />
              </div>
              <div class="item-details">
                <h4 class="item-name">{{ item.productName }}</h4>
                <div class="item-attributes" *ngIf="item.color || item.size || item.brand">
                  <span *ngIf="item.color" class="attribute">Color: {{ item.color }}</span>
                  <span *ngIf="item.size" class="attribute">Size: {{ item.size }}</span>
                  <span *ngIf="item.brand" class="attribute">Brand: {{ item.brand }}</span>
                </div>
                <div class="item-quantity">Quantity: {{ item.quantity }}</div>
              </div>
              <div class="item-price">
                <div class="unit-price">{{ item.price | currency:'EGP' }}</div>
                <div class="total-price">{{ item.totalPrice | currency:'EGP' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Delivery Information -->
        <div class="delivery-info" *ngIf="order.deliveryAddress">
          <h3>Delivery Information</h3>
          <div class="delivery-card">
            <p class="delivery-address">{{ order.deliveryAddress }}</p>
            <p class="estimated-delivery">
              Estimated Delivery: {{ order.estimatedDeliveryDate | date:'medium' }}
            </p>
          </div>
        </div>

        <!-- Order Notes -->
        <div class="order-notes" *ngIf="order.note">
          <h3>Order Notes</h3>
          <p>{{ order.note }}</p>
        </div>

        <!-- Order Actions -->
        <div class="order-actions">
          <button 
            *ngIf="order.canBeCancelled" 
            class="action-btn cancel-btn" 
            (click)="cancelOrder()">
            Cancel Order
          </button>
          <button class="action-btn primary-btn" (click)="goBack()">
            Back to Orders
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .order-details-container {
      max-width: 800px;
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      color: #6b7280;
      font-size: 16px;
      cursor: pointer;
      margin-bottom: 24px;
      padding: 8px 0;
      transition: color 0.2s ease;
    }

    .back-btn:hover {
      color: #dc2626;
    }

    .loading-state, .error-state {
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
    }

    .order-details {
      background: white;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .order-number {
      font-size: 24px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .order-date {
      color: #6b7280;
      margin: 0;
    }

    .status-badge {
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .status-icon {
      font-size: 16px;
      line-height: 1;
    }

    .status-pending {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      color: #92400e;
      border: 1px solid #f59e0b;
    }

    .status-processing {
      background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
      color: #5b21b6;
      border: 1px solid #8b5cf6;
    }

    .status-shipped {
      background: linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%);
      color: #0e7490;
      border: 1px solid #06b6d4;
    }

    .status-delivered {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      color: #047857;
      border: 1px solid #10b981;
    }

    .status-cancelled {
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      color: #991b1b;
      border: 1px solid #ef4444;
    }

    .order-summary {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .summary-card, .payment-card {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
    }

    .summary-card h3, .payment-card h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }

    .summary-row, .payment-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .summary-row.total {
      font-weight: 600;
      font-size: 16px;
      color: #111827;
      border-top: 1px solid #e5e7eb;
      padding-top: 8px;
      margin-top: 8px;
    }

    .discount {
      color: #059669;
    }

    .payment-status-pending {
      color: #d97706;
    }

    .payment-status-completed {
      color: #059669;
    }

    .payment-status-failed {
      color: #dc2626;
    }

    .transaction-id {
      font-family: monospace;
      font-size: 12px;
    }

    .order-items {
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .order-items h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .item-card {
      display: flex;
      gap: 16px;
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    .item-image {
      width: 80px;
      height: 80px;
      flex-shrink: 0;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }

    .item-details {
      flex: 1;
    }

    .item-name {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }

    .item-attributes {
      display: flex;
      gap: 12px;
      margin-bottom: 8px;
    }

    .attribute {
      font-size: 12px;
      color: #6b7280;
      background: #f3f4f6;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .item-quantity {
      font-size: 14px;
      color: #6b7280;
    }

    .item-price {
      text-align: right;
    }

    .unit-price {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .total-price {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }

    .delivery-info, .order-notes {
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .delivery-info h3, .order-notes h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }

    .delivery-card {
      background: #f9fafb;
      padding: 16px;
      border-radius: 8px;
    }

    .delivery-address {
      margin: 0 0 8px 0;
      font-size: 16px;
      color: #111827;
    }

    .estimated-delivery {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
    }

    .order-actions {
      display: flex;
      gap: 12px;
      padding: 24px;
      justify-content: flex-end;
    }

    .action-btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }

    .action-btn.primary-btn {
      background-color: #dc2626;
      color: white;
    }

    .action-btn.primary-btn:hover {
      background-color: #b91c1c;
    }

    .action-btn.cancel-btn {
      background-color: #f3f4f6;
      color: #374151;
    }

    .action-btn.cancel-btn:hover {
      background-color: #e5e7eb;
    }

    @media (max-width: 768px) {
      .order-summary {
        grid-template-columns: 1fr;
      }
      
      .order-actions {
        flex-direction: column;
      }
    }
  `]
})
export class OrderDetailsComponent implements OnInit {
  orderId: number = 0;
  order: OrderDetails | null = null;
  loading = false;
  error: string | null = null;

  OrderStatus = OrderStatus;
  PaymentStatus = PaymentStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = +params['id'];
      if (this.orderId) {
        this.loadOrderDetails();
      }
    });
  }

  loadOrderDetails(): void {
    this.loading = true;
    this.error = null;

    this.orderService.getOrderById(this.orderId).subscribe({
      next: (response: any) => {
        if (response.succeeded && response.data) {
          this.order = response.data;
        } else {
          this.error = response.message || 'Failed to load order details';
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error loading order details';
        this.loading = false;
        this.toastService.showError('Error loading order details');
      }
    });
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


  getStatusText(status: OrderStatus): string {
    if (typeof status === 'string') {
      switch ((status as string).toLowerCase()) {
        case 'pending':
          return 'Awaiting Confirmation';
        case 'processing':
          return 'Being Prepared';
        case 'shipped':
          return 'On The Way';
        case 'delivered':
          return 'Successfully Delivered';
        case 'cancelled':
          return 'Order Cancelled';
        default:
          return 'Unknown Status';
      }
    }
    switch (status) {
      case OrderStatus.Pending:
        return 'Awaiting Confirmation';
      case OrderStatus.Processing:
        return 'Being Prepared';
      case OrderStatus.Shipped:
        return 'On The Way';
      case OrderStatus.Delivered:
        return 'Successfully Delivered';
      case OrderStatus.Cancelled:
        return 'Order Cancelled';
      default:
        return 'Unknown Status';
    }
  }

  getPaymentStatusClass(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Pending:
        return 'payment-status-pending';
      case PaymentStatus.Completed:
        return 'payment-status-completed';
      case PaymentStatus.Failed:
        return 'payment-status-failed';
      case PaymentStatus.Refunded:
        return 'payment-status-refunded';
      default:
        return 'payment-status-pending';
    }
  }

  cancelOrder(): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(this.orderId).subscribe({
      next: (response: any) => {
        if (response.succeeded) {
          this.toastService.showSuccess('Order cancelled successfully');
          this.loadOrderDetails(); // Refresh the order details
        } else {
          this.toastService.showError(response.message || 'Failed to cancel order');
        }
      },
      error: (err: any) => {
        this.toastService.showError('Error cancelling order');
      }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/orders']);
  }
}
