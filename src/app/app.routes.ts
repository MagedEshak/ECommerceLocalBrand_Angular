import { Routes } from '@angular/router';
import { Splash } from './components/splash/splash';
import { Home } from './components/home/home';
import { NotFound } from './components/not-found/not-found';
import { ProductDetails } from './components/product-details/product-details';
import { Order } from './components/order/order';

export const routes: Routes = [
  { path: '', component: Splash },
  { path: 'home', component: Home, title: 'Home' },
  { path: 'product-details', component: ProductDetails, title: 'Product Details' },
  { path: 'order', component: Order, title: 'Checkout ' },


  //Notfound
  { path: 'notFound', component: NotFound, title: 'Notfound' },
  { path: '**', redirectTo: 'notFound' }
];
