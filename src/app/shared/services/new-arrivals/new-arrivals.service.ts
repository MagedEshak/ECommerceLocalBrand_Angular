import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { IProduct } from '../../../models/iproduct';
import { IPaginate } from '../../../models/ipaginate';

@Injectable({
  providedIn: 'root'
})
export class NewArrivalsService {

  constructor(private _httpClient: HttpClient) { }

  getNewArrivalProducts(pageIndex: number) {
    const url = `${environment.urlPath}Products/new-arrivals?PageIndex=${pageIndex}`;
    return this._httpClient.get<IPaginate<IProduct>>(url);
  }
}
