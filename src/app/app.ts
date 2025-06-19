import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Splash } from './components/splash/splash';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Splash],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'Ecommerce_local_brand_front';
}
