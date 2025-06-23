import { Routes } from '@angular/router';
import { Splash } from './components/splash/splash';
import { Home } from './components/home/home';
import { NotFound } from './components/not-found/not-found';

export const routes: Routes = [
  { path: '', component: Splash },
  { path: 'home', component: Home },


  //Notfound
  { path: 'notFound', component: NotFound }
];
