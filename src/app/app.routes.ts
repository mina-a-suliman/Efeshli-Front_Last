import { provideRouter, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { EmailConfirmationComponent } from './features/auth/components/EmailConfirmation/EmailConfirmation.component';
// import { ProductDetailPageComponent } from './features/products/components/product-details/product-details';
import { CartItemsComponent } from './features/cart/components/cart-items/cart-items';
import { FullCartItemsComponent } from './shared/components/full-cart/full-cart-items';
import { UserDashboardComponent } from './shared/components/user-dashboard/user-dashboard.component';
import { ForgotPasswordComponent } from './features/auth/components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/components/reset-password/reset-password.component';
import { CategoryComponent } from './shared/components/category/category.component';
import { LoginComponent } from './features/auth/components/login/login';

import { authGuard } from './core/guards/auth-guard';
import { reverseAuthGuard } from './core/guards/reverse-auth-guard';
import { CheckoutComponent } from './features/Checkout/checkout';
import { ProductListComponent } from './features/products/components/product-list/product-list';
import { ContactUs } from './features/contact-us/contact-us';
import { ProductDetailPageComponent } from './features/products/components/product-details/product-details';
// import { ProductDetailsComponent } from './features/products/components/product-details/product-details';

export const routes: Routes = [
  // 🔹 Auth
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [reverseAuthGuard],
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/components/signup/signup').then(
        (m) => m.SignupComponent
      ),
    canActivate: [reverseAuthGuard],
  },
  {
    path: 'confirm-email',
    component: EmailConfirmationComponent,
    canActivate: [reverseAuthGuard],
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [reverseAuthGuard],
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    canActivate: [reverseAuthGuard],
  },

  // 🔹 Home
  { path: 'home', component: HomeComponent },

  // 🔹 Cart & Checkout
  // {
  //   path: 'cart',
  //   component: CartItemsComponent,
  //   canActivate: [authGuard],
  // },
  {
    path: 'cart',
    component: FullCartItemsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [authGuard],
  },
  {
    path: 'checkout-success',
    loadComponent: () =>
      import('./shared/components/checkout-success/checkout-success.component').then(
        (m) => m.CheckoutSuccessComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'checkout-cancel',
    loadComponent: () =>
      import('./shared/components/checkout-cancel/checkout-cancel.component').then(
        (m) => m.CheckoutCancelComponent
      ),
    canActivate: [authGuard],
  },

  // 🔹 Products
 { path: 'product-details/:id', component: ProductDetailPageComponent },

  { path: 'product-details', redirectTo: 'home', pathMatch: 'full' },
  { path: 'products', component: ProductListComponent },
  { path: 'category/:category', component: CategoryComponent },

   // 🔹 Contact us
   {path: 'contact-us', component: ContactUs},

  // 🔹 Wishlist
  {
    path: 'wishlist',
    loadComponent: () =>
      import('./features/wishlist/wishlist.component').then(
        (m) => m.WishlistComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'wishlist/:id',
    loadComponent: () =>
      import('./features/wishlist/wishlist.component').then(
        (m) => m.WishlistComponent
      ),
  },

  // 🔹 Dashboard (nested routes)
  {
    path: 'dashboard',
    component: UserDashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'profile',
        loadComponent: () =>
          import(
            './shared/components/user-dashboard/profile-content/profile-content.component'
          ).then((m) => m.ProfileContentComponent),
      },
      {
        path: 'address',
        loadComponent: () =>
          import(
            './shared/components/user-dashboard/addresses-content/addresses-content.component'
          ).then((m) => m.AddressesContentComponent),
      },
       {
        path: 'orders',
        loadComponent: () =>
          import(
            './shared/components/user-dashboard/orders-content/orders-content.component'
          ).then((m) => m.OrdersContentComponent),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import(
            './shared/components/user-dashboard/order-details/order-details.component'
          ).then((m) => m.OrderDetailsComponent),
      },
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full',
      },
    ],
  },

  // // 🔹 Orders (standalone route)
  // {
  //   path: 'orders',
  //   loadComponent: () =>
  //     import('./shared/components/order/order').then((m) => m.OrdersComponent),
  //   canActivate: [authGuard],
  // },

  // 🔹 Legacy redirects
  { path: 'profile', redirectTo: '/dashboard/profile', pathMatch: 'full' },
  { path: 'address', redirectTo: '/dashboard/address', pathMatch: 'full' },
  { path: 'orders-legacy', redirectTo: '/dashboard/orders', pathMatch: 'full' },

  // 🔹 Fallbacks
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },

 

];

export const appRouterProviders = provideRouter(routes);
