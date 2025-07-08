import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private _httpClient: HttpClient) { }

  getVerifyingCodeToLogin(email: string): Observable<any> {
    return this._httpClient.post(
      `${environment.urlPath}Account/SendVerificationCodeAsync`,
      `"${email}"`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  loginAfterGetCode(email: string, code: string): Observable<any> {
    return this._httpClient.post(
      `${environment.urlPath}Account/CustomerAccountLogin`, { email, code });
  }
}
