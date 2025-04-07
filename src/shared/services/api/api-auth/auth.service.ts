import { GlobalStore } from './../../../stores/global.store';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IUserAuthInfo } from '../../../models/user.modes';
import { concatMap, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiAuthService {
  #http = inject(HttpClient);
  #globalStore = inject(GlobalStore);
  private apiUrl = 'api/user';

  getUserInfo() {
    return this.#http.get<IUserAuthInfo>(`${this.apiUrl}`);
  }

  checkCanRegister() {
    return this.#http.get<{ responseData: boolean }>(`${this.apiUrl}/checkCanRegister`);
  }

  register(reqBody: IBasicAuth) {
    return this.#http.post(`${this.apiUrl}/register`, reqBody);
  }

  login(reqBody: IAuthWithTwoFactor) {
    const data =
      `loginId=${encodeURIComponent(reqBody.loginId)}` +
      `&password=${encodeURIComponent(reqBody.password)}` +
      `&twoFactorCode=${encodeURIComponent(reqBody.twoFactorCode)}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

    return this.#http.post<{ token: string }>(`${this.apiUrl}/login`, data, { headers, withCredentials: true });
  }

  logout() {
    return this.#http.post(`${this.apiUrl}/logout`, null).pipe(
      tap(() => {
        this.#globalStore.clearUserInfo();
      }),
      concatMap(() => {
        return this.#http.get<{ responseData: string }>(`${this.apiUrl}/renewCsrfTokenIfNotExist`);
      }),
    );
  }

  sendAuthCode(email: string) {
    return this.#http.post<{ responseData: boolean }>(`api/twoFactorAuth/getAuthCode`, { email });
  }

  sendResetPasswordEmail(email: string) {
    const params = new HttpParams().set('email', email);
    return this.#http.post<{ responseData: string }>(`${this.apiUrl}/confirmResetPassword`, null, { params });
  }

  checkIsResetPasswordTokenValid(token: string) {
    return this.#http.get<{ responseData: string }>(`${this.apiUrl}/checkResetPasswordToken`, { params: { token } });
  }

  confirmResetPassword(token: string, password: string) {
    return this.#http.post(`${this.apiUrl}/resetPassword`, { token, password });
  }
}

interface IBasicAuth {
  loginId: string;
  password: string;
}

interface IAuthWithTwoFactor extends IBasicAuth {
  twoFactorCode: string;
}
