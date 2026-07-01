import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StdResDto } from '../api-ai/api-ai.service'; // Reusing StdResDto for simplicity

export interface DailyNews {
  id: number;
  title: string;
  summary: string;
  url: string;
  imageUrl?: string;
  publishedDate: string;
  createdTime: string;
}

export interface PageableResponse<T> {
  content: T[];
  pageable: any;
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: any;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ApiNewsService {
  private apiUrl = 'api/news'; // 後端 API 的基礎 URL
  #http = inject(HttpClient); // 注入 HttpClient 服務

  constructor() {}

  getDailyNews(page: number = 0, size: number = 10): Observable<StdResDto<PageableResponse<DailyNews>>> {
    return this.#http.get<StdResDto<PageableResponse<DailyNews>>>(`${this.apiUrl}/daily?page=${page}&size=${size}`);
  }
}
