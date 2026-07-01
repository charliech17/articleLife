import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IArticleCategory, IArticleCategoryDTO } from '../../../models/article-category.models';

@Injectable({ providedIn: 'root' })
export class ApiArticleCategoriesService {
  #http = inject(HttpClient);
  private apiUrl = 'api/categories';

  getAllArticleCategories(): Observable<IArticleCategory[] | null> {
    return this.#http.get<IArticleCategory[] | null>(this.apiUrl, { withCredentials: true });
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

  // --- Standard Category Management CRUD ---

  createCategory(categoryData: IArticleCategoryDTO): Observable<IArticleCategory> {
    return this.#http.post<IArticleCategory>(`${this.apiUrl}/create`, categoryData);
  }

  updateCategory(categoryId: string, categoryData: IArticleCategoryDTO): Observable<IArticleCategory> {
    return this.#http.post<IArticleCategory>(`${this.apiUrl}/update/${categoryId}`, categoryData);
  }

  deleteCategory(categoryId: string): Observable<void> {
    return this.#http.post<void>(`${this.apiUrl}/delete/${categoryId}`, {});
  }
}
