import { GlobalStore } from './../../../stores/global.store';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IUserAuthInfo } from '../../../models/user.modes';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiAuthService {
  #http = inject(HttpClient);
  #globalStore = inject(GlobalStore);
  private apiUrl = 'api/user';

  getUserInfo() {
    return this.#http.get<IUserAuthInfo>(`${this.apiUrl}`);
  }

  register(reqBody: IBasicAuth) {
    return this.#http.post(`${this.apiUrl}/register`, reqBody);
  }

  login(reqBody: IBasicAuth) {
    const data = `loginId=${encodeURIComponent(reqBody.loginId)}` + `&password=${encodeURIComponent(reqBody.password)}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

    return this.#http.post<{ token: string }>(`${this.apiUrl}/login`, data, { headers, withCredentials: true });
  }
}

interface IBasicAuth {
  loginId: string;
  password: string;
}
