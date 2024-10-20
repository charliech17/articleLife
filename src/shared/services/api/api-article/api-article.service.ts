import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiArticleService {
  private apiUrl = 'api/articles'; // 後端 API 的基礎 URL
  #http = inject(HttpClient); // 注入 HttpClient 服務

  constructor() {}

  // 創建文章
  createArticle(articleDetail: any): Observable<any> {
    return this.#http.post(`${this.apiUrl}/create`, articleDetail);
  }

  // 獲取所有文章
  getAllArticles(): Observable<any> {
    return this.#http.get(`${this.apiUrl}`);
  }
}
