import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiAuthService {
  #http = inject(HttpClient);
  private apiUrl = 'api/user';

  register(reqBody: IBasicAuth) {
    return this.#http.post(`${this.apiUrl}/register`, reqBody);
  }

  login(reqBody: IBasicAuth) {
    const data = `loginId=${encodeURIComponent(reqBody.loginId)}` + `&password=${encodeURIComponent(reqBody.password)}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

    return this.#http.post<{ token: string }>(`api/login`, data, { headers, withCredentials: true });
  }
}

interface IBasicAuth {
  loginId: string;
  password: string;
}
