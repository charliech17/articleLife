import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IArticleDetails, IArticleInfo } from '../../../models/article.models';

@Injectable({
  providedIn: 'root',
})
export class ApiArticleService {
  private apiUrl = 'api/articles'; // 後端 API 的基礎 URL
  #http = inject(HttpClient); // 注入 HttpClient 服務

  constructor() {}

  // 創建文章
  createArticle(articleDetail: IArticleDetails): Observable<{ responseData: IArticleDetails }> {
    return this.#http.post<{ responseData: IArticleDetails }>(`${this.apiUrl}/create`, articleDetail);
  }

  // 獲取所有文章
  getAllArticles(): Observable<any> {
    return this.#http.get(`${this.apiUrl}`);
  }

  getAllArticleInfo(): Observable<IArticleInfo[]> {
    return this.#http.get<IArticleInfo[]>(`${this.apiUrl}/allInfo`);
  }

  // 獲取單篇文章
  getArticle(id: string): Observable<IArticleDetails> {
    return this.#http.get<IArticleDetails>(`${this.apiUrl}/${id}`);
  }

  // 更新文章
  updateArticle(articleDetail: any): Observable<any> {
    return this.#http.put(`${this.apiUrl}/${articleDetail.id}`, articleDetail, { responseType: 'text' });
  }

  // 更新文章類別
  updateArticleCategories(articleId: number, categories: string): Observable<string> {
    return this.#http.put<string>(`${this.apiUrl}/${articleId}/categories`, { categories });
  }

  // 是否可以編輯文章
  checkCanEditArticle(articleId: string, userLoginId: string): Observable<boolean> {
    return this.#http.post<boolean>(`${this.apiUrl}/canEdit`, { articleId, userLoginId });
  }
}
