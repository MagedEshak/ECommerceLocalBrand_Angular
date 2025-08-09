import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { IContactUs } from '../../../models/IContact-us';

@Injectable({
  providedIn: 'root',
})
export class ContactUsService {
  constructor(private httpClient: HttpClient) {}

  SendContactUsEmail(ContactUsForm: IContactUs): Observable<IContactUs> {
    return this.httpClient.post<IContactUs>(
      `${environment.urlPath}ContactUs/send`,
      ContactUsForm
    );
  }
}
