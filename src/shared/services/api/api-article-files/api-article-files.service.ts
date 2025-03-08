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
  constructor() {}

  getAllArticleFiles() {
    return this.#http.get<IArticleFile[]>(this.apiUrl);
  }

  getFileAndArticleByArticleId(articleId: string) {
    return this.#http.get<IArticleFile | null>(`${this.apiUrl}/${articleId}`);
  }
}
