import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { CartItemService } from '../../shared/services/cart/cart.service';
import { AuthService } from '../../shared/services/Auth/auth.service';
import { ICartItem } from '../../models/ICartItem';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
  imports: [CommonModule, DecimalPipe, RouterModule], // <-- أضف RouterModule هنا
})
export class Cart implements OnInit {
  @Output() close = new EventEmitter<void>();

  cartItems: ICartItem[] = [];
  estimatedTotal = 0;

  constructor(
    private cartService: CartItemService,
    private authService: AuthService // ⬅️ نستخدمه بدل ما نعتمد على cartService.getToken()
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
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        this.cartItems = JSON.parse(storedCart);
        this.calculateTotal();
      } catch (e) {
        console.error('❌ Error parsing local cart:', e);
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
    item.quantity++;
    item.totalPriceForOneItemType = item.unitPrice * item.quantity;

    if (this.authService.getToken()) {
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
      this.updateLocalCartItem(item);
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
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
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
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
      this.calculateTotal();
    }
  }

  closeCartBtn(): void {
    this.close.emit();
  }
}
