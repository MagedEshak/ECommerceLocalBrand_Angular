import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { RouterStateService } from './services/router-state.service';
import { CommonModule } from '@angular/common'; // ✅ أضف ده

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Header, Footer], // ✅ أضف CommonModule هنا
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'Ecommerce_local_brand_front';

  constructor(public routerState: RouterStateService) { }
}
