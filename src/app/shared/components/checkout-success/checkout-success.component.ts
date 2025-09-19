// checkout-success.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-checkout-success',
  template: `<h2>Payment Successful!</h2><p>Session ID: {{ sessionId }}</p>`
})
export class CheckoutSuccessComponent implements OnInit {
  sessionId: string | null = null;
  constructor(private route: ActivatedRoute, private toastService: ToastService) {}
  ngOnInit(): void { 
    this.sessionId = this.route.snapshot.queryParamMap.get('session_id');
    this.toastService.orderPlacedSuccess();
  }
}