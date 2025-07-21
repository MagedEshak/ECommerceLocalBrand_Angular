import { Component, EventEmitter, OnInit, Output,ChangeDetectorRef } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { CartItemService } from '../../shared/services/cart/cart.service';
import { AuthService } from '../../shared/services/Auth/auth.service';
import { ICartItem } from '../../models/ICartItem';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import Swal from 'sweetalert2';
import { ProductDetailsService } from '../../shared/services/Product/product-details.service';
import { MatDialog } from '@angular/material/dialog';
import { Login } from '../login/login';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
  imports: [CommonModule, DecimalPipe, RouterModule, FormsModule], // <-- أضف RouterModule هنا
})
export class Cart implements OnInit {
  @Output() close = new EventEmitter<void>();

  cartItems: ICartItem[] = [];
  estimatedTotal = 0;
  isLoggedInNow = false;

  constructor(
    private cartService: CartItemService,
    private authService: AuthService, // ⬅️ نستخدمه بدل ما نعتمد على cartService.getToken()
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private productDetailsService: ProductDetailsService // ⬅️ ضفنا السيرفيس هنا
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken(); // ✅ استخدم AuthService مباشرة

    if (token) {
      this.loadServerCart();
    } else {
      this.loadLocalCart();
    }
  }

  loadServerCart(): void {
    this.cartService.getCurrentUserCart().subscribe({
      next: (res: any) => {
        const items = res?.cartItems ?? [];

        this.cartItems = items.map((item: any) => ({
          id: item.id, // ✅ خد الآي دي هنا
          productId: item.productId,
          productName: item.productName ?? 'Unknown',
          productImageUrl: item.productImageUrl
            ? environment.baseServerUrl + item.productImageUrl
            : '',
          productSizeName: item.productSizeName ?? '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPriceForOneItemType: item.totalPriceForOneItemType,
        }));

        this.calculateTotal();
      },
      error: (err) => {
        console.error('❌ Error fetching server cart:', err);
      },
    });
  }
  loadLocalCart(): void {
    const storedCart = localStorage.getItem('guestCart');
    if (storedCart) {
      try {
        const rawItems = JSON.parse(storedCart);

        this.cartItems = rawItems.map((item: any) => ({
          ...item,
          productImageUrl: item.image,
        }));

        this.calculateTotal();
      } catch (e) {
        console.error('❌ Error parsing local guest cart:', e);
      }
    }
  }

  calculateTotal(): void {
    this.estimatedTotal = this.cartItems.reduce(
      (acc, item) => acc + item.totalPriceForOneItemType,
      0
    );
  }

  increaseQuantity(item: ICartItem): void {
    const token = this.authService.getToken();

    if (token) {
      // لو يوزر مسجل دخول
      item.quantity++;
      item.totalPriceForOneItemType = item.unitPrice * item.quantity;

      this.cartService.updateCartItemQuantity(item).subscribe({
        next: () => this.calculateTotal(),
        error: (err) => {
          item.quantity--; // نرجّع الكمية القديمة

          Swal.fire({
            icon: 'error',
            title: 'Insufficient quantity available',
            text: 'The requested quantity exceeds the available stock.',
            showConfirmButton: false,
            timer: 2500,
          });
        },
      });
    } else {
      // Guest user 🧑‍🦲
      this.productDetailsService.getProductById(item.productId).subscribe({
        next: (res) => {
          const sizeObj = res.productSizes?.find(
            (s) => +s.id === +item.productSizeId // نعمل casting للأمان
          );

          if (!sizeObj) {
            Swal.fire({
              icon: 'error',
              title: 'Size not found',
              text: 'The selected size does not exist anymore.',
              showConfirmButton: false,
              timer: 2500,
            });
            return;
          }

          const availableStock = sizeObj?.stockQuantity || 0;

          if (item.quantity < availableStock) {
            item.quantity++;
            item.totalPriceForOneItemType = item.unitPrice * item.quantity;
            this.updateLocalCartItem(item);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Insufficient quantity available',
              text: `Only ${availableStock} left in stock.`,
              showConfirmButton: false,
              timer: 2500,
            });
          }
        },
        error: (err) => {
          console.error('❌ Failed to fetch stock info:', err);
          Swal.fire({
            icon: 'error',
            title: 'Something went wrong',
            text: 'Unable to verify available stock.',
          });
        },
      });
    }
  }

  decreaseQuantity(item: ICartItem): void {
    if (item.quantity <= 1) return;

    item.quantity--;
    item.totalPriceForOneItemType = item.unitPrice * item.quantity;

    if (this.authService.getToken()) {
      this.cartService.updateCartItemQuantity(item).subscribe({
        next: () => this.calculateTotal(),
        error: () => item.quantity++,
      });
    } else {
      this.updateLocalCartItem(item);
    }
  }

  removeItem(item: ICartItem): void {
    if (this.authService.getToken()) {
      this.cartService.deleteCartItem(item.id).subscribe({
        next: () => {
          this.cartItems = this.cartItems.filter((ci) => ci.id !== item.id);
          this.calculateTotal();
        },
      });
    } else {
      this.cartItems = this.cartItems.filter(
        (ci) =>
          ci.productId !== item.productId ||
          ci.productSizeId !== item.productSizeId
      );
      localStorage.setItem('guestCart', JSON.stringify(this.cartItems));
      this.calculateTotal();
    }
  }

  private updateLocalCartItem(updatedItem: ICartItem): void {
    const index = this.cartItems.findIndex(
      (ci) =>
        ci.productId === updatedItem.productId &&
        ci.productSizeId === updatedItem.productSizeId
    );

    if (index !== -1) {
      this.cartItems[index] = updatedItem;
      localStorage.setItem('guestCart', JSON.stringify(this.cartItems));
      this.calculateTotal();
    }
  }

  closeCartBtn(): void {
    this.close.emit();
  }
  completeCheckout(): void {
  const token = this.authService.getToken();
  const isLoggedIn = !!token;

  if (!isLoggedIn) {
    this.isLoggedInNow = true;

    const dialogRef = this.dialog.open(Login, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.token) {
        this.router.navigate(['/order']);
      }
    });
  } else {
    this.router.navigate(['/order']);
  }
}

}
