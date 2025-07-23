import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { RouterStateService } from './shared/services/Router-State/router-state.service';
import * as AOS from 'aos';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
  protected title = 'E-Commerce CashLook';

  constructor(
    public routerState: RouterStateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      AOS.init();
      AOS.refresh();
    }
  }
}
