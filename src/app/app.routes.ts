import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { NotFound } from './components/not-found/not-found';
import { ProductDetails } from './components/product-details/product-details';
import { Order } from './components/order/order';
import { MainLayout } from './components/main-layout/main-layout';
import { AllProducts } from './components/all-products/all-products';
import { Login } from './components/login/login';
import { authGuard } from './shared/guards/auth-guard';

export const routes: Routes = [
  {
    // Pages with Header and Footer
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        component: Home,
        title: 'Home',
      },
      {
        path: 'home',
        component: Home,
        title: 'Home',
      },
      {
        path: 'allProducts',
        component: AllProducts,
        title: 'All Products',
      },
      {
        path: 'product-details/:id',
        component: ProductDetails,
        title: 'Product Details',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/profile/profile').then((m) => m.ProfileComponent),
        canActivate: [authGuard],
      },
      {
        path: 'previous-orders',
        loadComponent: () =>
          import('./components/previous-orders/previous-orders').then(
            (m) => m.PreviousOrders
          ),
        canActivate: [authGuard],
        title: 'Previous Orders',
      },
      {
        path: 'order',
        component: Order,
        title: 'Checkout',
      },
    ],
  },
  // Pages without Header and Footer
  {
    path: 'login',
    component: Login,
    title: 'Login',
  },

  //Notfound
  {
    path: '**',
    component: NotFound,
  },
];
