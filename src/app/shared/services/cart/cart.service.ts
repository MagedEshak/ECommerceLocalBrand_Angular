import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IProduct } from '../../../models/iproduct';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../Auth/auth.service';
import { ICartItem } from '../../../models/ICartItem';

@Injectable({
  providedIn: 'root',
})
export class CartItemService {
  private cartItemApi = `${environment.baseServerUrl}/api/CartItem`;
  private cartApi = `${environment.baseServerUrl}/api/Cart`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // ✅ إضافة منتج مفرد (single item)
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
        observer.error(new Error('Selected size not found'));
        return;
      }

      const token = this.authService.getToken();
      let headers = new HttpHeaders();
      if (token) headers = headers.set('Authorization', `Bearer ${token}`);

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

          const payload = {
            id: 0,
            productId: product.id,
            productSizeId: sizeObj.id,
            quantity: quantity,
            unitPrice: product.price,
            totalPriceForOneItemType: product.price * quantity,
            productName: product.name,
            productImageUrl: product.productImagesPaths?.[0]?.imagePath ?? '',
            productSizeName: selectedSize,
          };

          const url = `${this.cartItemApi}/add-single`;

          this.http.post(url, payload, { headers }).subscribe({
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

  // ✅ ترحيل الجست كارت بعد اللوجين
  addToCartFromLocalStorageAfterLogin(
    items: ICartItem[]
  ): Observable<ICartItem[]> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    const url = `${this.cartItemApi}/add-multiple`;
    return this.http.post<ICartItem[]>(url, items, { headers });
  }
  // ✅ جلب كارت المستخدم الحالي
  getCurrentUserCart(): Observable<any> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    return new Observable((observer) => {
      this.http.get<any>(this.cartApi, { headers }).subscribe({
        next: (cart) => {
          observer.next(cart);
          observer.complete();
        },
        error: (err) => {
          if (err.status === 404) {
            observer.next(null);
            observer.complete();
          } else {
            observer.error(err);
          }
        },
      });
    });
  }

  updateCartItemQuantity(item: ICartItem): Observable<any> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    return this.http.put(this.cartItemApi, item, { headers });
  }

  deleteCartItem(cartItemId: number): Observable<any> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    return this.http.delete(`${this.cartItemApi}?cartItemId=${cartItemId}`, {
      headers,
    });
  }
}
