import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Splash } from './components/splash/splash';
import { Header } from "./components/header/header";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Splash, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'Ecommerce_local_brand_front';
}
