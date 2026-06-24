import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IArticleFile } from '../../../models/article.models';

@Injectable({
  providedIn: 'root',
})
export class ApiArticleFilesService {
  #http = inject(HttpClient);
  private apiUrl = 'api/files';

  allArticleFiles: IArticleFile[] = [];
  constructor() { }

  getFileAndArticleByArticleId(articleId: string) {
    return this.#http.get<IArticleFile | null>(`${this.apiUrl}/${articleId}`);
  }

  getAllArticleFilesByArticleIds(ids: number[]) {
    return this.#http.post<IArticleFile[]>(`${this.apiUrl}/article`, { articleIds: [...ids] });
  }
}
