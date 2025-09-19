import { Component } from '@angular/core';

@Component({
  selector: 'app-cart-items',
  standalone: true,
  templateUrl: './cart-items.html',
  styleUrls: ['./cart-items.css']
})
export class CartItemsComponent {
  startShopping() {
    console.log('Redirecting to shop...');
  }
}