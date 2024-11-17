import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IArticleCategory } from '../../../../pages/edit-article/components/article-meta-data-setting-dialog/article-meta-data-setting-dialog.component';

@Injectable({ providedIn: 'root' })
export class ApiArticleCategoriesService {
  #http = inject(HttpClient);
  private apiUrl = 'api/categories';

  getAllArticleCategories(): Observable<IArticleCategory[] | null> {
    return this.#http.get<IArticleCategory[] | null>(this.apiUrl);
  }

  getArticleRelatedCategories(articleId: number): Observable<IArticleCategory[]> {
    return this.#http.get<IArticleCategory[]>(`${this.apiUrl}/${articleId}`);
  }

  saveAllCategories(categories: { articleId: number; articleCategoriesInfo: IArticleCategory[] }): Observable<any> {
    return this.#http.post(`${this.apiUrl}/saveAll`, categories);
  }

  updateCategories(categories: {
    articleId: number;
    articleCategoriesInfo: IArticleCategory[];
    articleCategoriesJSON: string;
  }): Observable<string> {
    return this.#http.put<string>(`${this.apiUrl}/update`, categories);
  }
}
