import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { IProduct } from '../../../models/iproduct'; // عدّل المسار حسب مكان الموديل
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CartItemService {
  private apiUrl = `${environment.baseServerUrl}/api/CartItem`;

  constructor(private http: HttpClient) {}

  /**
   * Add an item to the cart using full product model
   */
  addToCart(
    product: IProduct,
    selectedSize: string,
    quantity: number
  ): Observable<any> {
    if (!product.productSizes || product.productSizes.length === 0) {
      return throwError(() => new Error('Product sizes not available'));
    }

    const sizeObj = product.productSizes.find((s) => s.size === selectedSize);

    if (!sizeObj) {
      return throwError(() => new Error('Selected size not found in product'));
    }

    const unitPrice = product.price;
    const payload = {
      cartId: 0, // السيرفر هيحسبها بناءً على اليوزر غالبًا
      productId: product.id,
      productSizeId: sizeObj.id,
      quantity: quantity,
      unitPrice: unitPrice,
      totalPriceForOneItemType: unitPrice * quantity,
    };

    return this.http.post(this.apiUrl, payload);
  }
}
