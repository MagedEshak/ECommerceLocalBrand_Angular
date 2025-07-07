import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IProduct } from '../../../models/iproduct';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ProductDetailsService {
  constructor(private _httpClient: HttpClient) {}

  getProductById(id: number): Observable<IProduct> {
    const url = `${environment.urlPath}Products/${id}`;
    return this._httpClient.get<IProduct>(url);
  }
}
