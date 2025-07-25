import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RealTimeService } from './shared/services/RealTime/real-time-service';

import { RouterStateService } from './shared/services/Router-State/router-state.service';
import * as AOS from 'aos';
import { isPlatformBrowser } from '@angular/common';
import { Spinner } from './components/spinner/spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Spinner],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
  protected title = 'E-Commerce CashLook';

  constructor(
    public routerState: RouterStateService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private realTimeService: RealTimeService
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      AOS.init();
      AOS.refresh();
      this.realTimeService.startConnection();
    }
  }
}
