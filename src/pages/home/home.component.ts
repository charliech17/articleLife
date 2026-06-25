import { Component, computed, effect, inject, OnDestroy, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiArticleService } from '../../shared/services/api/api-article/api-article.service';
import { ArticleListComponent } from './components/article-list/article-list.component';
import { ApiArticleFilesService } from '../../shared/services/api/api-article-files/api-article-files.service';
import { ArticleTypePrivate, IArticleFile, IArticleInfo } from '../../shared/models/article.models';
import { ActivatedRoute, Router } from '@angular/router';
import { map, of, Subject, switchMap, takeUntil, EMPTY } from 'rxjs';
import { GlobalStore } from '../../shared/stores/global.store';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ArticleListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  #apiArticleService = inject(ApiArticleService);
  #apiArticleFilesService = inject(ApiArticleFilesService);
  #globalStore = inject(GlobalStore);
  #platformId = inject(PLATFORM_ID);

  $$allArticles = signal<IArticleInfo[]>([]);
  $$privateArticles = signal<IArticleInfo[]>([]);
  $$isShowPrivateArticles = signal<boolean>(false);

  $$articleIdMapFile = signal<Map<number, IArticleFile[]>>(new Map());
  $currentPage = signal(0);
  $currentPageForDisplay = computed(() => this.$currentPage() + 1);
  $totalPages = signal(1);
  $categoryId = signal<string>('');
  #router = inject(Router);
  #route = inject(ActivatedRoute);
  #destroy$ = new Subject<void>();

  constructor() {
    this.#route.queryParamMap
      .pipe(
        switchMap(queryParam => {
          const isPrivate = queryParam.get('articleType') == ArticleTypePrivate;
          this.$$isShowPrivateArticles.set(isPrivate);

          const currentPage = queryParam.get('page') || 1;
          this.$currentPage.set(Number(currentPage) - 1);
          this.$categoryId.set(queryParam.get('categoryId') || '');

          // 當判斷為伺服器端 (SSR) 且正在請求「私有文章」時，會直接回傳 EMPTY 中斷這一次的資料流，不發送 API 請求（從而避免了 401 錯誤）
          if (isPrivate && !isPlatformBrowser(this.#platformId)) {
            return EMPTY;
          }

          const articles$ = isPrivate
            ? this.#apiArticleService.getMyPrivateArticleByPage(this.$currentPage())
            : this.#apiArticleService.getArticleByPage(this.$currentPage(), this.$categoryId());

          return articles$.pipe(
            switchMap(res => {
              const articles = res.responseData.content;
              if (articles.length === 0) {
                return of({ res, filesList: [] as IArticleFile[] });
              }

              const articleIds = articles.map(article => article.id);
              return this.#apiArticleFilesService.getAllArticleFilesByArticleIds(articleIds).pipe(
                map(filesList => ({ res, filesList }))
              );
            })
          );
        }),
        takeUntil(this.#destroy$),
      )
      .subscribe({
        next: ({ res, filesList }) => {
          const articles = res.responseData.content;
          this.sortByLastModifyTime(articles);
          if (this.$$isShowPrivateArticles()) {
            this.$$privateArticles.set(articles);
          } else {
            this.$$allArticles.set(articles);
          }

          const newMap = new Map<number, IArticleFile[]>();
          filesList.forEach(file => {
            const list = newMap.get(file.articleId) || [];
            list.push(file);
            newMap.set(file.articleId, list);
          });
          this.$$articleIdMapFile.set(newMap);

          this.$currentPage.set(res.responseData.currentPage);
          this.$totalPages.set(res.responseData.totalPages);
          if (typeof window !== 'undefined') {
            setTimeout(() => {
              window.scrollTo(0, 0);
            }, 0);
          }
        },
        error: err => {
          if ((err.status === 401, !this.#globalStore.isLoggedIn())) {
            this.#router.navigate(['/login'], { replaceUrl: true });
          }
        },
      });
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
  }

  navigatePage(incrementNum: number): void {
    if (this.$currentPage() + incrementNum < 0 || this.$currentPage() + incrementNum >= this.$totalPages()) {
      return;
    }

    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: { page: this.$currentPageForDisplay() + incrementNum },
      queryParamsHandling: 'merge',
    });
  }

  private sortByLastModifyTime(source: IArticleInfo[]): void {
    source.sort((a, b) => {
      if (a.lastModifyTime && b.lastModifyTime) {
        return new Date(b.lastModifyTime).getTime() - new Date(a.lastModifyTime).getTime();
      }
      return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
    });
  }
}
