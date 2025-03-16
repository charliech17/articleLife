import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IArticleResponses } from '../../../models/article.models';

@Injectable({
  providedIn: 'root',
})
export class ApiArticleResponseService {
  private apiUrl = 'api/article-response'; // 後端 API 的基礎 URL
  #http = inject(HttpClient); // 注入 HttpClient 服務

  // 新增文章回應
  createArticleResponse(reqBody: any): Observable<{ responseData: IArticleResponses; success: boolean }> {
    return this.#http.post<{ responseData: IArticleResponses; success: boolean }>(`${this.apiUrl}`, reqBody);
  }

  // 獲取文章回應
  getArticleResponses(articleId: string): Observable<IArticleResponses[]> {
    return this.#http.get<IArticleResponses[]>(`${this.apiUrl}/${articleId}`);
  }
}
