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

  // 獲取單篇文章
  getArticle(id: string): Observable<any> {
    return this.#http.get(`${this.apiUrl}/${id}`);
  }

  // 更新文章
  updateArticle(articleDetail: any): Observable<any> {
    return this.#http.put(`${this.apiUrl}/${articleDetail.id}`, articleDetail);
  }
}
