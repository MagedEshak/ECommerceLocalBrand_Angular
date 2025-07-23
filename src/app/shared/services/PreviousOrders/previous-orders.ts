import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPreviousOrder } from '../../../models/iprevious-order';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

import { AuthService } from '../Auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PreviousOrder {
  private apiUrl = `${environment.urlPath}Order/previous-orders`; // Adjust the URL as needed
  constructor(private http: HttpClient, private auth: AuthService) {}

  getPreviousOrders(): Observable<IPreviousOrder[]> {
    return this.http.get<IPreviousOrder[]>(this.apiUrl, {
      headers: {
        Authorization: `Bearer ${this.auth.getToken()}`,

        'Content-Type': 'application/json',
      },
    });
  }
}
