import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { IAccount } from '../../../models/IAccount';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private _httpClient: HttpClient) { }

  getVerifyingCodeToLogin(email: string): Observable<any> {
    return this._httpClient.post(
      `${environment.urlPath}Account/SendVerificationCodeAsync`,
      `"${email}"`, // لازم يكون string JSON
      {
        headers: {
          'Content-Type': 'application/json' // لازم تكون كده بالحرف
        }
      }
    );

  }

}
