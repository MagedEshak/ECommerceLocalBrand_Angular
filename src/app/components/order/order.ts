import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CartItemService } from '../../shared/services/cart/cart.service';
import { AuthService } from '../../shared/services/Auth/auth.service';
import { ICartItem } from '../../models/ICartItem';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './order.html',
  styleUrl: './order.css',
})
export class Order implements OnInit {
  cartItems: ICartItem[] = [];
  estimatedTotal: number = 0;

  constructor(
    private cartService: CartItemService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();

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
          id: item.id,
          productId: item.productId,
          productSizeId: item.productSizeId,
          productName: item.productName ?? 'Unknown',
          productSizeName: item.productSizeName ?? '',
          productImageUrl: item.productImageUrl
            ? environment.baseServerUrl + item.productImageUrl
            : '/assets/images/default.png',
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
          productId: item.productId,
          productSizeId: item.productSizeId,
          productName: item.name ?? 'Unknown',
          productSizeName: item.productSizeName ?? '',
          productImageUrl: item.image || '/assets/images/default.png',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPriceForOneItemType: item.totalPriceForOneItemType,
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
}
