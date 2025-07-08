import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterStateService } from '../../shared/services/Router-State/router-state.service';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../shared/services/Auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {
  @ViewChild('profileIcon') profileIcon!: ElementRef;
  @ViewChild('cartIcon') cartIcon!: ElementRef;
  isLoggedIn = false;
  constructor(
    public routerState: RouterStateService,
    private router: Router,
    private authService: AuthService
  ) {
    this.authService.isLoggedIn().subscribe((status) => {
      this.isLoggedIn = status;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

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

  get isHome(): boolean {
    return this.routerState.isHome;
  }
  // logout() {
  //   alert('✅ LogOut');
  //   this.cookieService.deleteAll();
  //   this.router.navigate(['/home']);
  // }
}
