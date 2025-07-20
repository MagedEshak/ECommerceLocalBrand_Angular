import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPreviousOrder } from '../../../models/iprevious-order';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class PreviousOrder {
  private apiUrl = `${environment.baseServerUrl}Order/with-customer`; // Adjust the URL as needed
  constructor(private http: HttpClient, private cookieService: CookieService) {}

  getPreviousOrders(): Observable<IPreviousOrder[]> {
    return this.http.get<IPreviousOrder[]>(this.apiUrl, {
      headers: {
        Authorization: `Bearer ${this.cookieService.get('token')}`,
        'Content-Type': 'application/json',
      },
    });
  }
}
