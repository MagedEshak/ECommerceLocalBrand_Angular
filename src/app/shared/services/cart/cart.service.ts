import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IProduct } from '../../../models/iproduct';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../Auth/auth.service';
import { ICartItem } from '../../../models/ICartItem';

@Injectable({
  providedIn: 'root',
})
export class CartItemService {
  private apiUrl = `${environment.baseServerUrl}/api/CartItem/add-single`;
  private addMultipleUrl = `${environment.baseServerUrl}/api/CartItem/add-multiple`;
  private updateUrl = `${environment.baseServerUrl}/api/CartItem/`;
  private DeleteUrl = `${environment.baseServerUrl}/api/CartItem/`;

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
            id: 0, // 👈 لازم موجود حتى لو السيرفر بيهمله في الإضافة
            cartId: 0, // 👈 كذلك
            productId: product.id,
            productSizeId: sizeObj.id,
            quantity: quantity,
            unitPrice: product.price,
            totalPriceForOneItemType: product.price * quantity,

            // خصائص اتضافت في الـ DTO
            productName: product.name,
            productImageUrl: product.productImagesPaths?.[0]?.imagePath ?? '',
            productSizeName: selectedSize,
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

  addToCartFromLocalStorageAfterLogin(cartItems: ICartItem[]) {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post(this.addMultipleUrl, cartItems, { headers });
  }

  getCurrentUserCart(): Observable<any> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return new Observable((observer) => {
      this.http.get<any>(this.cartUrl, { headers }).subscribe({
        next: (cart) => {
          console.log('✅ Cart loaded successfully:', cart);
          observer.next(cart);
          observer.complete();
        },
        error: (err) => {
          if (err.status === 404) {
            // ✅ مفيش كارت، نعتبرها null مش خطأ
            observer.next(null);
            observer.complete();
          } else {
            observer.error(err);
          }
        },
      });
    });
  }

  /**
   * تعديل كمية عنصر في الكارت
   */
  updateCartItemQuantity(item: ICartItem): Observable<any> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.put(this.updateUrl, item, { headers });
  }

  /**
   * حذف عنصر من الكارت
   */
  deleteCartItem(cartItemId: number): Observable<any> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.delete(`${this.DeleteUrl}?cartItemId=${cartItemId}`, {
      headers,
    });
  }

  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  updateCartCount(count: number) {
    this.cartCountSubject.next(count);
  }
  loadCartCountFromLocalStorage() {
    const cart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    this.updateCartCount(cart.length);
  }
}
