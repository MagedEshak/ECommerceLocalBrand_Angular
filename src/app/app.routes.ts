import { Routes } from '@angular/router';
import { Splash } from './components/splash/splash';
import { Home } from './components/home/home';

export const routes: Routes = [
  { path: '', component: Splash },
  { path: 'home', component: Home },
];
