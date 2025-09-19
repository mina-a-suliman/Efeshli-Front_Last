import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({ 
  selector: 'app-checkout-cancel', 
  template: `<h2>Payment Cancelled</h2>` 
})
export class CheckoutCancelComponent implements OnInit {
  constructor(private toastService: ToastService) {}
  
  ngOnInit(): void {
    this.toastService.showWarning('Payment was cancelled', 'Payment Cancelled');
  }
}