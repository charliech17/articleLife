import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../env/env';

export interface AiArticleCategory {
  id: number;
  categoryName: string;
  description: string;
  categoryOrder: number;
}

export interface AiArticleDetails {
  id: number;
  title: string;
  intro: string;
  articleContent: string;
  createdTime: string;
  categoryId: number;
  viewTimes: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiAiArticleService {
  #http = inject(HttpClient);

  getAiCategories(): Observable<AiArticleCategory[]> {
    return this.#http.get<AiArticleCategory[]>(`${environment.apiPath}/api/ai-articles/categories`);
  }

  getAiArticles(page: number, size: number = 10, categoryId?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }

    return this.#http.get(`${environment.apiPath}/api/ai-articles/list`, { params });
  }

  getAiArticleById(id: string | number): Observable<AiArticleDetails> {
    return this.#http.get<AiArticleDetails>(`${environment.apiPath}/api/ai-articles/${id}`);
  }
}
