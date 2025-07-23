import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IProduct } from '../../../models/iproduct';
import { environment } from '../../../../environments/environment.development';
import { IPaginate } from '../../../models/ipaginate';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private _httpClient: HttpClient) { }

  getAllProductsByPaginate(pageIndex: number): Observable<IPaginate<IProduct>> {
    const url = `${environment.urlPath}Products/Custpaginated?PageIndex=${pageIndex}`;
    console.log('Requesting:', url);
    return this._httpClient.get<IPaginate<IProduct>>(url);
  }
}
