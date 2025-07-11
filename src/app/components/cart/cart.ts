import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { CartItemService } from '../../shared/services/cart/cart.service';
import { AuthService } from '../../shared/services/Auth/auth.service';
import { ICartItem } from '../../models/ICartItem';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment.development';

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

  increaseQuantity(item: ICartItem): void {}
  decreaseQuantity(item: ICartItem): void {}
  removeItem(item: ICartItem): void {}

  closeCartBtn(): void {
    this.close.emit();
  }
}
