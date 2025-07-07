import { AfterViewInit, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { RouterStateService } from './shared/services/Router-State/router-state.service';
import * as AOS from 'aos';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
  protected title = 'E-Commerce CashLook';

  constructor(public routerState: RouterStateService) { }

  ngAfterViewInit(): void {
    AOS.init();
    AOS.refresh();
  }
}
