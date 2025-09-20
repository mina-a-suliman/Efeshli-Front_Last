// app.ts
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// 🔹 Auth Components
import { LoginComponent } from './features/auth/components/login/login';
import { SignupComponent } from './features/auth/components/signup/signup';
import { EmailConfirmationComponent } from './features/auth/components/EmailConfirmation/EmailConfirmation.component';

// 🔹 Feature Components
import { HomeComponent } from "./features/home/home.component";
import { ProductDetailPageComponent } from './features/products/components/product-details/product-details';
import { CartItemsComponent } from './features/cart/components/cart-items/cart-items';
import { WishlistComponent } from './features/wishlist/wishlist.component';

// 🔹 Shared Components
import { FullCartItemsComponent } from './shared/components/full-cart/full-cart-items';
import { ProfileComponent } from './shared/components/profile/profile';
// import { AddressesComponent } from './shared/components/addresses/addresses';
import { HeaderComponent } from "./shared/components/header/header";
import { FooterComponent } from "./shared/components/footer/footer";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ReactiveFormsModule,

    // Auth
    LoginComponent,
    SignupComponent,
    EmailConfirmationComponent,

    // Features
    HomeComponent,
    ProductDetailPageComponent,
    CartItemsComponent,
    WishlistComponent,

    // Shared
    FullCartItemsComponent,
    ProfileComponent,
    // AddressesComponent,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  protected readonly title = signal('eFreshli-clone');
}
