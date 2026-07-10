import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAiArticleFile } from '../../../models/ai-article.models';

export interface AiArticleCategory {
  id: number;
  categoryName: string;
  description: string;
  categoryOrder: number;
}

export interface AiArticleCategoryAdmin extends AiArticleCategory {
  requestedTopic?: string;
}

export interface AiArticleDetails {
  id: number;
  title: string;
  intro: string;
  articleContent: string;
  createdTime: string;
  categoryId: number;
  viewTimes: number;
  category?: AiArticleCategory;
}

@Injectable({
  providedIn: 'root'
})
export class ApiAiArticleService {
  #http = inject(HttpClient);

  getAiCategories(): Observable<AiArticleCategory[]> {
    return this.#http.get<AiArticleCategory[]>(`api/ai-articles/categories`);
  }

  getAiArticles(page: number, size: number = 10, categoryId?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }

    return this.#http.get(`api/ai-articles/list`, { params });
  }

  getAiArticleById(id: string | number): Observable<AiArticleDetails> {
    return this.#http.get<AiArticleDetails>(`api/ai-articles/${id}`);
  }

  getAiArticleFilesByArticleIds(articleIds: number[]): Observable<IAiArticleFile[]> {
    return this.#http.post<IAiArticleFile[]>(`api/ai-articles/files`, { articleIds });
  }

  getAdminCategories(): Observable<AiArticleCategoryAdmin[]> {
    return this.#http.get<AiArticleCategoryAdmin[]>(`api/ai-articles/admin/categories`);
  }

  updateRequestedTopic(id: number, requestedTopic: string | null): Observable<AiArticleCategoryAdmin> {
    return this.#http.post<AiArticleCategoryAdmin>(`api/ai-articles/admin/categories/${id}/requested-topic`, { requestedTopic });
  }
}
