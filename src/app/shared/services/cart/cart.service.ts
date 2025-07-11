import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IProduct } from '../../../models/iproduct';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../Auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CartItemService {
  private apiUrl = `${environment.baseServerUrl}/api/CartItem`;
  private cartUrl = `${environment.baseServerUrl}/api/Cart`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * إضافة منتج للكارت
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

      const token = this.authService.getToken();
      let headers = new HttpHeaders();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }

      this.getCurrentUserCart().subscribe({
        next: (cart: any) => {
          const cartItems = cart?.cartItems || [];

          const existingItem = cartItems.find(
            (item: any) =>
              item.productId === product.id && item.productSizeId === sizeObj.id
          );

          const oldQuantity = existingItem?.quantity || 0;
          const totalQuantity = oldQuantity + quantity;

          if (totalQuantity > sizeObj.stockQuantity) {
            observer.error(
              new Error(
                `الكمية المطلوبة (${totalQuantity}) أكثر من المتاح (${sizeObj.stockQuantity})`
              )
            );
            return;
          }

          const unitPrice = product.price;
          const payload = {
            cartId: 0, // السيرفر هيحدد الكارت للمستخدم الحالي
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
            error: (err) => observer.error(err),
          });
        },
        error: (err) => observer.error(err),
      });
    });
  }

  /**
   * تحميل كارت المستخدم من السيرفر
   */
  getCurrentUserCart(): Observable<any> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get<any>(this.cartUrl, { headers });
  }
}
