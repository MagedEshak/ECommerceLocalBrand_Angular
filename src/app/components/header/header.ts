import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterStateService } from '../../shared/services/Router-State/router-state.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {

  @ViewChild('profileIcon') profileIcon!: ElementRef;
  @ViewChild('cartIcon') cartIcon!: ElementRef;

  constructor(public routerState: RouterStateService) {
  }

  get isHome(): boolean {
    return this.routerState.isHome;
  }

  // get isNotFound(): boolean {
  //   return this.routerState.isNotFound;
  // }

  hideProfile() {
    const el = this.profileIcon.nativeElement.classList;

    if (el.contains('md:hidden')) {
      el.remove('md:hidden');
      el.add('md:block');
    } else {
      el.add('md:hidden');
      el.remove('md:block');
    }
  }


  hideCart() {
    const el = this.cartIcon.nativeElement.classList;
    if (el.contains('md:hidden')) {
      el.remove('md:hidden');
      el.add('md:block');
    } else {
      el.add('md:hidden');
      el.remove('md:block');
    }
  }

  closeCartBtn() {
    const el = this.cartIcon.nativeElement.classList;
    el.add('md:hidden');
    el.remove('md:block');
  }
}
