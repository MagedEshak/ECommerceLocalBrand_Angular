import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IProduct } from '../../../models/iproduct';
import { environment } from '../../../../environments/environment.development';
import { ICustomer, IOrder } from '../../../models/IOrder';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../Auth/auth.service';


@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private _httpClient: HttpClient , private auth:AuthService) {}


  // 1. Get addresses for specific user (by ID)
  getAddressesByUserId(userId: string): Observable<any[]> {
    return this._httpClient.get<any[]>(
      `${environment.baseServerUrl}/api/Account/addresses`,
            {    headers: {
        Authorization: `Bearer ${this.auth.getToken()}`,

        'Content-Type': 'application/json',
      },}
    );
  }

  // 2. Get shipping cost per governorate
getGovernorateShippingCosts(): Observable<{ id: number; name: string; shippingCost: number }[]> {
  return this._httpClient.get<{ id: number; name: string; shippingCost: number }[]>(
    `${environment.baseServerUrl}/api/GovernorateShippingCost`
  );
}


  // 3. Post payment checkout
  checkoutOrder(paymentData: any): Observable<any> {
    return this._httpClient.post<any>(
      `${environment.baseServerUrl}/api/payment/checkout`,
      paymentData
    );
  }
  // 4. Post  getCustomerById
getCustomerById(): Observable<ICustomer> {
  return this._httpClient.get<ICustomer>(
    `${environment.baseServerUrl}/api/Account`,
              {    headers: {
        Authorization: `Bearer ${this.auth.getToken()}`,

        'Content-Type': 'application/json',
      },}
  ).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Something went wrong';

      if (error.status === 404) {
        errorMessage = 'Customer not found.';
      } else if (error.status === 0) {
        errorMessage = 'Cannot connect to the server.';
      }

      // اختياري: اطبع أو سجل الخطأ في الـ console
      console.error('Error fetching customer:', error);

      return throwError(() => new Error(errorMessage));
    })
  );
}



}
