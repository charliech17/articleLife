import { Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ApiAiArticleService } from '../../../../shared/services/api/api-ai-article/api-ai-article.service';
import { parseMarkdownArticle } from '../../../../shared/utils/markdown.util';

export interface IArticleReadDialogData {
  articleId: number;
  title?: string;
}

/**
 * 以彈窗（而非跳轉頁面）瀏覽 AI 文章內容，供對戰擂台與首頁邀請彈窗共用
 */
@Component({
  selector: 'app-article-read-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './article-read-dialog.component.html',
  styleUrl: './article-read-dialog.component.scss',
})
export class ArticleReadDialogComponent {
  #dialogRef = inject(MatDialogRef<ArticleReadDialogComponent>);
  #data = inject<IArticleReadDialogData>(MAT_DIALOG_DATA);
  #apiAiArticleService = inject(ApiAiArticleService);
  #sanitizer = inject(DomSanitizer);
  #router = inject(Router);

  $$title = signal<string>(this.#data.title ?? '文章');
  $$loading = signal<boolean>(true);
  $$error = signal<boolean>(false);
  $$contentHtml = signal<SafeHtml | null>(null);

  $$articleId = computed(() => this.#data.articleId);

  constructor() {
    this.#apiAiArticleService.getAiArticleById(this.#data.articleId).subscribe({
      next: article => {
        this.$$title.set(article.title || this.$$title());
        const html = parseMarkdownArticle(article.articleContent);
        this.$$contentHtml.set(this.#sanitizer.bypassSecurityTrustHtml(html));
        this.$$loading.set(false);
      },
      error: () => {
        this.$$error.set(true);
        this.$$loading.set(false);
      },
    });
  }

  /** 開新分頁看完整文章頁（含目錄、知識地圖等功能） */
  openFullPage(): void {
    this.#dialogRef.close();
    this.#router.navigate(['ai-view-article', this.#data.articleId]);
  }

  close(): void {
    this.#dialogRef.close();
  }
}
