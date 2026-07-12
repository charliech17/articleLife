import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * 會員 AI 文章閱讀進度 API（需登入）
 */
@Injectable({
  providedIn: 'root'
})
export class ApiReadingProgressService {
  #http = inject(HttpClient);

  getReadAiArticleIds(): Observable<number[]> {
    return this.#http.get<number[]>(`api/reading-progress/ai-articles`);
  }

  /** 合併 localStorage 已讀紀錄，回傳合併後完整清單 */
  syncReadAiArticles(articleIds: number[]): Observable<number[]> {
    return this.#http.post<number[]>(`api/reading-progress/ai-articles/sync`, { articleIds });
  }
}
