
// // main.ts
// import 'zone.js';
// import { bootstrapApplication } from '@angular/platform-browser';
// import { AppComponent } from './app/app';
// import { appConfig } from './app/app.config';
// import { appRouterProviders } from './app/app.routes';
// import { provideHttpClient, withInterceptors } from '@angular/common/http';
// import { provideRouter } from '@angular/router';
// import { routes } from './app/app.routes';
// import { CUSTOM_ELEMENTS_SCHEMA, importProvidersFrom } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { authInterceptor } from '../src/app/core/interceptors/auth.interceptor';

// ////////
// bootstrapApplication(AppComponent, {
//   providers: [

//     appRouterProviders,
//     provideHttpClient(withInterceptors([authInterceptor])),
//     provideRouter(routes),
//     importProvidersFrom(FormsModule, CommonModule), // ✅ ضيف الاتنين
//   ],

// },

// ).catch(err => console.error(err));


// main.ts
import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';
import { appRouterProviders, routes } from './app/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

bootstrapApplication(AppComponent, {
  ...appConfig, // keep existing config
  providers: [
    ...(appConfig.providers || []),

    // 🔹 Router
    appRouterProviders,

    // 🔹 HTTP with interceptor
    provideHttpClient(withInterceptors([authInterceptor])),

    // 🔹 Forms & Common
    importProvidersFrom(FormsModule, CommonModule),

    // 🔹 Animations & Toastr
    provideAnimations(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
  ],
}).catch(err => console.error(err));