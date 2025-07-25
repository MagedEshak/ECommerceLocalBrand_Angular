import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { RouterStateService } from '../../shared/services/Router-State/router-state.service';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../shared/services/Auth/auth.service';
import { Cart } from '../cart/cart';
import { filter } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { Login } from '../login/login';
import { MatDialogModule } from '@angular/material/dialog';
import { CartItemService } from '../../shared/services/cart/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, MatDialogModule, Cart], // ✅ أضف هنا
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header implements OnInit {
  isLoggedIn = false;
  isCartVisible = false;
  isProfileVisible = false;
  isMobileMenuVisible = false;
  cartCount = 0; // عداد السلة

  constructor(
    private cartservice: CartItemService,
    public routerState: RouterStateService,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
    private eRef: ElementRef
  ) {
    this.authService.isLoggedIn().subscribe((status) => {
      this.isLoggedIn = status;
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isCartVisible = false;
        this.closeProfile();
      });
  }
  ngOnInit(): void {
    this.cartservice.cartCount$.subscribe((count) => {
      console.log('Cart Count:', count);
      this.cartCount = count;
    });
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
    //clear local storage
    localStorage.removeItem('guestCart');
  }

  toggleProfile() {
    this.isProfileVisible = !this.isProfileVisible;
  }

  closeProfile() {
    this.isProfileVisible = false;
  }

  toggleCart() {
    this.isCartVisible = !this.isCartVisible;
  }

  closeCart() {
    this.isCartVisible = false;
  }

  get isHome(): boolean {
    return this.routerState.isHome;
  }

  openLoginDialog() {
    const dialogRef = this.dialog.open(Login, {
      width: '400px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'logged-in') {
        // ✅ المستخدم سجل دخول فعلاً
        this.isLoggedIn = true;
      }
    });
  }
  toggleMobileMenu() {
    this.isMobileMenuVisible = !this.isMobileMenuVisible;
  }

  closeMobileMenu() {
    this.isMobileMenuVisible = false;
  }
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const targetElement = event.target as HTMLElement;

    // لو مش جزء من الكومبوننت
    if (!this.eRef.nativeElement.contains(targetElement)) {
      this.isCartVisible = false;
      this.isProfileVisible = false;
      this.isMobileMenuVisible = false;
    }
  }
}
