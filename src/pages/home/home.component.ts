import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ApiArticleService } from '../../shared/services/api/api-article/api-article.service';
import { ArticleListComponent } from './components/article-list/article-list.component';
import { ApiArticleFilesService } from '../../shared/services/api/api-article-files/api-article-files.service';
import { IArticleFile, IArticleInfo } from '../../shared/models/article.models';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';

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

  $$allArticles = signal<IArticleInfo[]>([]);
  $$allArticleFiles = signal<IArticleFile[]>([]);
  articleIdMapFile: Map<number, IArticleFile[]> = new Map();
  $currentPage = signal(0);
  $currentPageForDisplay = computed(() => this.$currentPage() + 1);
  $totalPages = signal(1);
  $categoryId = signal<string>('');
  #router = inject(Router);
  #route = inject(ActivatedRoute);
  #destroy$ = new Subject<void>();

  constructor() {
    this.#apiArticleFilesService.getAllArticleFiles().subscribe(res => {
      this.$$allArticleFiles.set(res);
      res.forEach(file => {
        if (this.articleIdMapFile.has(file.articleId)) {
          this.articleIdMapFile.get(file.articleId)!.push(file);
        } else {
          this.articleIdMapFile.set(file.articleId, [file]);
        }
      });
    });

    this.#route.queryParamMap
      .pipe(
        switchMap(queryParam => {
          const currentPage = queryParam.get('page') || 1;
          this.$currentPage.set(Number(currentPage) - 1);
          this.$categoryId.set(queryParam.get('categoryId') || '');
          return this.#apiArticleService.getArticleByPage(this.$currentPage(), this.$categoryId());
        }),
        takeUntil(this.#destroy$),
      )
      .subscribe(res => {
        this.sortByLastModifyTime(res.responseData.content);
        this.$$allArticles.set(res.responseData.content);
        this.$currentPage.set(res.responseData.currentPage);
        this.$totalPages.set(res.responseData.totalPages);
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 0);
        }
      });
  }

  ngOnInit(): void {
    console.log('ngOnInit');
  }

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
