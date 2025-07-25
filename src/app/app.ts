import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { RealTimeService } from './shared/services/RealTime/real-time-service';

import { RouterStateService } from './shared/services/Router-State/router-state.service';
import * as AOS from 'aos';
import { isPlatformBrowser } from '@angular/common';
import { Spinner } from './components/spinner/spinner';
import { CartItemService } from './shared/services/cart/cart.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Spinner],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit, OnInit {
  protected title = 'E-Commerce CashLook';

  constructor(
    public routerState: RouterStateService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private realTimeService: RealTimeService,
    private router: Router,
    private cartService: CartItemService
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.cartService.loadCartCountFromLocalStorage();
      });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      AOS.init();
      AOS.refresh();
      this.realTimeService.startConnection();
    }
  }
}
