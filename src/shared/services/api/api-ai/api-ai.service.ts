import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ChatRequestDto {
  message: string;
}

export interface StdResDto<T> {
  code: string;
  message: string;
  responseData: T;
}

@Injectable({
  providedIn: 'root',
})
export class ApiAiService {
  private apiUrl = 'api/ai'; // 後端 API 的基礎 URL
  #http = inject(HttpClient); // 注入 HttpClient 服務

  constructor() {}

  chat(message: string): Observable<StdResDto<string>> {
    return this.#http.post<StdResDto<string>>(`${this.apiUrl}/chat`, { message });
  }
}
