import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { IProduct } from '../../../models/iproduct';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CartItemService {
  private apiUrl = `${environment.baseServerUrl}/api/CartItem`;

  constructor(private http: HttpClient) {}

  /**
   * Add an item to the cart after validating quantity against existing items
   */
  addToCart(
    product: IProduct,
    selectedSize: string,
    quantity: number
  ): Observable<void> {
    return new Observable<void>((observer) => {
      const sizeObj = product.productSizes?.find(
        (s) => s.size === selectedSize
      );

      if (!sizeObj) {
        observer.error(new Error('Selected size not found in product'));
        return;
      }

      const token = this.getTokenFromCookies('token');
      let headers = new HttpHeaders();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }

      // Step 1: Fetch current cart from server
      this.getCurrentUserCart().subscribe({
        next: (cart: any) => {
          const cartItems = cart.cartItems || [];

          const existingItem = cartItems.find(
            (item: any) =>
              item.productId === product.id && item.productSizeId === sizeObj.id
          );

          const oldQuantity = existingItem?.quantity || 0;
          const totalQuantity = oldQuantity + quantity;

          if (totalQuantity > sizeObj.stockQuantity) {
            observer.error(
              new Error(
                `Requested quantity  (${totalQuantity}) is more than avaialable quantity (${sizeObj.stockQuantity})`
              )
            );
            return;
          }

          // باقي الكود...

          // Step 2: Send POST to add to cart
          const unitPrice = product.price;
          const payload = {
            cartId: 0, // سيتم تعيينه من خلال السيرفر للمستخدم الحالي
            productId: product.id,
            productSizeId: sizeObj.id,
            quantity: quantity,
            unitPrice: unitPrice,
            totalPriceForOneItemType: unitPrice * quantity,
          };

          this.http.post(this.apiUrl, payload, { headers }).subscribe({
            next: () => {
              observer.next();
              observer.complete();
            },
            error: (err) => {
              observer.error(err);
            },
          });
        },
        error: (err) => {
          observer.error(err);
        },
      });
    });
  }

  /**
   * Get the current user's cart from the server
   */
  getCurrentUserCart(): Observable<any[]> {
    const token = this.getTokenFromCookies('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${environment.baseServerUrl}/api/Cart`;
    return this.http.get<any[]>(url, { headers });
  }
  /**
   * Helper to get a cookie value by name
   */
  private getTokenFromCookies(name: string): string | null {
    const match = document.cookie.match(
      new RegExp('(^| )' + name + '=([^;]+)')
    );
    return match ? decodeURIComponent(match[2]) : null;
  }
}
