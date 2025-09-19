import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderCheckoutPreview } from '../../core/models/order.model';
import { AccountService } from '../../core/services/Account.service';
import { CartItemDto, CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { StripeService } from '../../core/services/Stripe.service';
import { ToastService } from '../../core/services/toast.service';

// Define governorates first
const governorates = [
  'Cairo',
  'Giza',
  'Alexandria',
  'North Coast',
  'Ras El Hekma',
  'Red Sea',
  'Soma Bay',
  'Ain Sokhna'
] as const;

type Governorate = typeof governorates[number];

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class CheckoutComponent implements OnInit {
  deliveryForm: FormGroup;
  paymentMethod = 'credit-card';
  checkoutAsCompany = false;
  showCommentPopup = false;
  comment = '';
  showEditAddress = false;
  showAddAddress = false;
  selectedGovernorate: Governorate = 'Giza';
  selectedArea = 'Dokki';
  floorNumber = '2';
  streetAddress = 'qena';
  phoneNumber = '+20 11 12880371';
  selectedInstallmentPlan = '';
  showInstallmentDropdown = false;

  savedAddresses = ['Giza, Dokki, qena'];

  // cartItems = [
  //   { name: 'TORNADO Turkish Coffee Maker', price: 3079, image: 'https://dkq2tfmdsh9ss.cloudfront.net/products/68b991a771920.jpeg' },
  //   { name: 'Plain Jute Rug', price: 11530, size: '150*200', image: 'https://dkq2tfmdsh9ss.cloudfront.net/products/8v6TCBi7BvSfsUsg02PAktgSoemFyQECPT4zMLOU.jpg' },
  // ];



  subtotal = 14609;
  tax = 'included in product prices';
  shippingFurniture = 250;
  shippingAppliance = 100;
  totalShipping = 350;
  total = 14959;
  estimatedDelivery = 'Thursday, Sep 25, 2025';

  governorates = governorates;

  areas: { [K in Governorate]: string[] } = {
    'Cairo': ['15 May', 'Al Azbakeyah', 'Al Basatin', 'Tebin', 'El-Khalifa', 'El darrasa', 'Aldarb Alahmar', 'Zawya al-Hamra', 'El-Zaytoun'],
    'Giza': ['Dokki', 'Other areas in Giza'],
    'Alexandria': ['Alexandria Area 1', 'Alexandria Area 2'],
    'North Coast': ['North Coast Area 1'],
    'Ras El Hekma': ['Ras El Hekma Area 1'],
    'Red Sea': ['Red Sea Area 1'],
    'Soma Bay': ['Soma Bay Area 1'],
    'Ain Sokhna': ['Ain Sokhna Area 1']
  };

  floorNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];

  bankInstallmentPlans = [
    'NBE | installment plan',
    'CIB | installment plan',
    'Bank Misr | installment plan'
  ];


// Order variables & models (start)
coupon:string='';
orderCheckoutPreview!:OrderCheckoutPreview;
cartItems:CartItemDto[]=[];
// Order variables & models (end)

  constructor(private fb: FormBuilder, private stripeService: StripeService, private toastService: ToastService, private orderService: OrderService, private accountService: AccountService,private cartService:CartService) {
    this.deliveryForm = this.fb.group({
      street: [''],
      governorate: ['Giza'],
      area: ['Dokki'],
      floor: ['2'],
      phone: ['+20 11 12880371']
    });
  }

  ngOnInit() {
    // Load checkout preview
    this.orderService.getCheckoutPreview().subscribe({
      next: (res: any) => {
        if (res?.succeeded && res.data) {
          this.orderCheckoutPreview = res.data;
          // this.subtotal = res.data.subTotalPrice ?? res.data.SubTotalPrice;
          // this.shippingFurniture = res.data.shippingPrice ?? res.data.ShippingPrice;
          // this.totalShipping = this.shippingFurniture; // if needed, split types later
          // this.total = res.data.totalPrice ?? res.data.TotalPrice;
          // const est = res.data.estimatedDeliveryDate ?? res.data.EstimatedDeliveryDate;
          // this.estimatedDelivery = est ? new Date(est).toDateString() : this.estimatedDelivery;
        }
      },
      error: () => {
        // Keep defaults but notify softly in console
        console.warn('Failed to load checkout preview');
      }
    });
    // Load cart items
    this.cartService.getCart().subscribe({
      next: (res: any) => {
        if (res?.succeeded && res.data && res.data.items) {
          this.cartItems = res.data.items;
        }
      },
      error: () => {
        console.warn('Failed to load cart items');
      }
    });
  }

  toggleEditAddress() {
    this.showEditAddress = true;
    this.showAddAddress = false;
  }

  toggleCompanyCheckout() {
    this.checkoutAsCompany = !this.checkoutAsCompany;
  }

  openCommentPopup(event: Event) {
    event.preventDefault(); // Prevent default link behavior
    this.showCommentPopup = true; // Show the popup
  }

  saveComment() {
    this.showCommentPopup = false; // Hide the popup after saving
    console.log('Comment saved:', this.comment);
    this.comment = ''; // Clear the comment field
  }

  cancelComment() {
    this.showCommentPopup = false; // Hide the popup on cancel
    this.comment = ''; // Clear the comment field
  }

  addNewAddress() {
    this.showAddAddress = true;
    this.showEditAddress = false;
    this.selectedGovernorate = 'Cairo';
    this.selectedArea = this.areas['Cairo'][0];
    this.streetAddress = '';
    this.floorNumber = '1';
    this.phoneNumber = '';
  }

  saveAddress() {
    const newAddress = `${this.selectedGovernorate}, ${this.selectedArea}, ${this.streetAddress}`;
    if (this.showAddAddress) {
      this.savedAddresses.push(newAddress);
      this.toastService.showSuccess('Address added successfully', 'Address Saved');
    } else if (this.showEditAddress) {
      this.savedAddresses = [newAddress];
      this.toastService.showSuccess('Address updated successfully', 'Address Updated');
    }
    this.showEditAddress = false;
    this.showAddAddress = false;
  }

  cancelAddress() {
    if (this.showEditAddress) {
      this.selectedGovernorate = 'Giza';
      this.selectedArea = 'Dokki';
      this.streetAddress = 'qena';
      this.floorNumber = '2';
      this.phoneNumber = '+20 11 12880371';
    }
    this.showEditAddress = false;
    this.showAddAddress = false;
  }

  onGovernorateChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedGovernorate = selectElement.value as Governorate;
    this.selectedArea = this.areas[this.selectedGovernorate][0];
  }

  toggleInstallmentDropdown() {
    this.showInstallmentDropdown = !this.showInstallmentDropdown;
  }

  selectInstallmentPlan(plan: string) {
    this.selectedInstallmentPlan = plan;
    this.paymentMethod = 'bank-installments';
    this.showInstallmentDropdown = false;
  }

  confirmOrder() {
    const selectedAddressId = this.accountService.getSelectedAddressId();
    // if (!selectedAddressId) {
    //   this.toastService.showError('Please select a delivery address first', 'Address Required');
    //   return;
    // }
    // this.stripeService.checkout(selectedAddressId /*, optional coupon here*/).subscribe({
    this.stripeService.checkout(207 /*, optional coupon here*/).subscribe({

      next: () => {
        this.toastService.showInfo('Processing your order...', 'Order Processing');
      },
      error: err => {
        this.toastService.showError('Failed to process order. Please try again.', 'Order Error');
        console.error('Checkout error:', err);
      }
    });
  }
}