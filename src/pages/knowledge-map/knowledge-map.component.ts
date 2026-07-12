import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  AiArticleCategory,
  AiArticleMapNode,
  ApiAiArticleService
} from '../../shared/services/api/api-ai-article/api-ai-article.service';
import { ReadingProgressService } from '../../shared/services/reading-progress.service';
import { SEOService } from '../../shared/services/seo.service';

interface ICategoryGroup {
  category: AiArticleCategory;
  nodes: AiArticleMapNode[];
}

/**
 * 知識地圖：AI 文章化為星圖節點，讀完點亮。
 */
@Component({
  selector: 'app-knowledge-map',
  standalone: true,
  imports: [],
  templateUrl: './knowledge-map.component.html',
  styleUrls: ['./knowledge-map.component.scss']
})
export class KnowledgeMapComponent {
  #router = inject(Router);
  #platformId = inject(PLATFORM_ID);
  #apiAiArticleService = inject(ApiAiArticleService);
  #readingProgressService = inject(ReadingProgressService);
  #seoService = inject(SEOService);

  $$categories = signal<AiArticleCategory[]>([]);
  $$nodes = signal<AiArticleMapNode[]>([]);
  $$loading = signal<boolean>(true);

  /** 依分類分組的星座 */
  $groups = computed<ICategoryGroup[]>(() => {
    const nodes = this.$$nodes();
    const categories = [...this.$$categories()].sort((a, b) => a.categoryOrder - b.categoryOrder);

    const groups: ICategoryGroup[] = categories
      .map(category => ({
        category,
        nodes: nodes.filter(n => n.categoryId === category.id)
      }))
      .filter(group => group.nodes.length > 0);

    // 沒有對應分類的文章歸到「未分類星域」
    const knownCategoryIds = new Set(categories.map(c => c.id));
    const orphanNodes = nodes.filter(n => !knownCategoryIds.has(n.categoryId));
    if (orphanNodes.length > 0) {
      groups.push({
        category: { id: -1, categoryName: '未分類星域', description: '', categoryOrder: 999 },
        nodes: orphanNodes
      });
    }

    return groups;
  });

  $totalCount = computed(() => this.$$nodes().length);
  $totalReadCount = computed(() => {
    const readIds = this.#readingProgressService.$$readIds();
    return this.$$nodes().filter(n => readIds.has(n.id)).length;
  });
  $totalProgress = computed(() => {
    const total = this.$totalCount();
    return total === 0 ? 0 : Math.round((this.$totalReadCount() / total) * 100);
  });

  constructor() {
    this.loadMapData();
    this.#seoService.updateMetaTags({
      title: '知識地圖',
      description: '讀完 AI 文章，點亮你的知識星圖',
      keywords: 'AI, 文章, 知識地圖',
      ogTitle: '知識地圖',
      ogDescription: '讀完 AI 文章，點亮你的知識星圖',
      ogImage: ''
    });
  }

  loadMapData(): void {
    forkJoin({
      categories: this.#apiAiArticleService.getAiCategories(),
      nodes: this.#apiAiArticleService.getAiArticleMapNodes()
    }).subscribe({
      next: ({ categories, nodes }) => {
        this.$$categories.set(categories);
        this.$$nodes.set(nodes);
        this.$$loading.set(false);
      },
      error: error => {
        console.error(error);
        this.$$loading.set(false);
      }
    });
  }

  isRead(articleId: number): boolean {
    return this.#readingProgressService.$$readIds().has(articleId);
  }

  groupReadCount(group: ICategoryGroup): number {
    const readIds = this.#readingProgressService.$$readIds();
    return group.nodes.filter(n => readIds.has(n.id)).length;
  }

  isGroupCompleted(group: ICategoryGroup): boolean {
    return group.nodes.length > 0 && this.groupReadCount(group) === group.nodes.length;
  }

  openArticle(node: AiArticleMapNode): void {
    if (!isPlatformBrowser(this.#platformId)) {
      return;
    }
    const encodedId = window.btoa(node.id.toString());
    this.#router.navigate(['/ai-view-article', encodedId], { queryParams: { title: node.title } });
  }

  goGameMap(): void {
    this.#router.navigate(['/game-map']);
  }

  goHome(): void {
    this.#router.navigate(['/home']);
  }
}
