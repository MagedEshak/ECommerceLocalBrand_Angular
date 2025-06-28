import { Routes } from '@angular/router';
import { Splash } from './components/splash/splash';
import { Home } from './components/home/home';
import { NotFound } from './components/not-found/not-found';
import { ProductDetails } from './components/product-details/product-details';

export const routes: Routes = [
  { path: '', component: Splash },
  { path: 'home', component: Home },
  { path: 'product-details', component: ProductDetails },


  //Notfound
  { path: 'notFound', component: NotFound }
];
