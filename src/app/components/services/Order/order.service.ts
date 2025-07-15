import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IProduct } from '../../../models/iproduct';
import { environment } from '../../../../environments/environment.development';
import { IOrder } from '../../../models/IOrder';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private _httpClient: HttpClient) {}

  cachedAddresses: any[] = [];

  getOrderById(id: number): Observable<IOrder> {
    const url = `${environment.urlPath}Orders/${id}`;
    return this._httpClient.get<IOrder>(url);
  }

  getGovernorates(): Observable<{ id: number, name: string }[]> {
    return this._httpClient.get<{ id: number, name: string }[]>(
      `${environment.baseServerUrl}/api/governorates`
    );
  }

  getUserAddresses(): Observable<any[]> {
    return this._httpClient.get<any[]>(`${environment.baseServerUrl}/api/addresses`);
  }

  loadUserAddresses(): void {
    this.getUserAddresses().subscribe({
      next: (addresses) => {
        console.log('✅ Loaded user addresses:', addresses);
        this.cachedAddresses = addresses;
      },
      error: (err) => {
        console.error('❌ Failed to load user addresses:', err);
      }
    });
  }
}
