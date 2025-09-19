export interface OrderCheckoutPreview {
  subTotalPrice: number;
  discountValue?: number;
  shippingPrice: number;
  totalPrice: number;
  estimatedDeliveryDate: Date;
}

export interface OrderSummary {
  orderId: number;
  subTotalPrice: number;
  discountValue?: number;
  shippingPrice: number;
  totalPrice: number;
  estimatedDeliveryDate: Date;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdDate: Date;
  itemsCount: number;
  orderItems: OrderItemSummary[];
  couponCode?: string;
  
  // UI properties (computed from backend)
  orderNumber: string;
  totalDisplayText: string;
  statusText: string;
  productImages: string[];
}

export interface OrderItemSummary {
  productItemId: number;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  totalPrice: number;
  color?: string;
  size?: string;
  brand?: string;
  category?: string;
}

export interface OrderDetails {
  orderId: number;
  applicationUserId: string;
  orderItems: OrderItemDetails[];
  subTotalPrice: number;
  discountValue?: number;
  shippingPrice: number;
  totalPrice: number;
  note?: string;
  estimatedDeliveryDate: Date;
  couponId?: number;
  couponCode?: string;
  status: OrderStatus;
  addressId?: number;
  deliveryAddress?: string;
  paymentId?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  createdDate: Date;
  
  // UI properties (computed from backend)
  orderNumber: string;
  orderIdDisplay: string;
  orderDateDisplay: string;
  statusText: string;
  paymentMethodText: string;
  paymentStatusText: string;
  numberOfProducts: number;
  totalAmountDisplay: string;
  canBeCancelled: boolean;
  productCustomizations: ProductCustomization[];
}

export interface OrderItemDetails {
  productItemId: number;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  totalPrice: number;
  color?: string;
  size?: string;
  brand?: string;
  category?: string;
}

export interface ProductCustomization {
  productName: string;
  fabric?: string;
  color?: string;
  brand?: string;
  category?: string;
  quantity: number;
  price: number;
  productImage?: string;
}

export enum OrderStatus {
  Pending = 0,
  Processing = 1,
  Shipped = 2,
  Delivered = 3,
  Cancelled = 4
}

export enum PaymentMethod {
  CashOnDelivery = 0,
  CreditCard = 1,
  PayPal = 2
}

export enum PaymentStatus {
  Pending = 0,
  Completed = 1,
  Failed = 2,
  Refunded = 3
}