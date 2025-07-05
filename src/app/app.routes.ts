import { Routes } from '@angular/router';
import { Splash } from './components/splash/splash';
import { Home } from './components/home/home';
import { NotFound } from './components/not-found/not-found';
import { ProductDetails } from './components/product-details/product-details';
import { Order } from './components/order/order';
import { MainLayout } from './components/main-layout/main-layout';

export const routes: Routes = [

  {
    // Pages with Header and Footer
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        component: Splash
      },
      {
        path: 'home',
        component: Home,
        title: 'Home'
      },
      {
        path: 'product-details/:id',
        component: ProductDetails,
        title: 'Product Details'
      }
    ]
  },
  // Pages without Header and Footer
  {
    path: 'order',
    component: Order,
    title: 'Checkout'
  },

  //Notfound
  {
    path: '**',
    component: NotFound
  }
];
