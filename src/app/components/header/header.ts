import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterStateService } from '../../shared/services/Router-State/router-state.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  constructor(public routerState: RouterStateService) {
  }

  get isHome(): boolean {
    return this.routerState.isHome;
  }

  // get isNotFound(): boolean {
  //   return this.routerState.isNotFound;
  // }


}
