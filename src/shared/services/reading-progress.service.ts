import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { GlobalStore } from '../stores/global.store';
import { StorageService } from './storage.service';
import { ApiReadingProgressService } from './api/api-reading-progress/api-reading-progress.service';

const READ_ARTICLES_KEY = 'al_ai_read_articles';

/**
 * AI 文章閱讀進度（知識地圖點亮用）
 * - 訪客：只存 localStorage
 * - 會員：登入後把 localStorage 進度同步到後端，並拉回完整已讀清單
 */
@Injectable({ providedIn: 'root' })
export class ReadingProgressService {
  #globalStore = inject(GlobalStore);
  #storageService = inject(StorageService);
  #apiReadingProgressService = inject(ApiReadingProgressService);

  /** 已讀的 AI 文章 id 集合 */
  $$readIds = signal<Set<number>>(new Set());
  $readCount = computed(() => this.$$readIds().size);

  #hasSyncedThisLogin = false;

  constructor() {
    this.$$readIds.set(this.#loadFromLocal());

    // 登入後同步 localStorage 進度到後端（每次登入只做一次）
    effect(() => {
      const loggedIn = this.#globalStore.isLoggedIn();
      const initFinished = this.#globalStore.hasStoreFinishedInit();

      if (!loggedIn) {
        this.#hasSyncedThisLogin = false;
        return;
      }

      if (initFinished && !this.#hasSyncedThisLogin) {
        this.#hasSyncedThisLogin = true;
        this.#syncWithBackend();
      }
    });
  }

  isRead(articleId: number): boolean {
    return this.$$readIds().has(articleId);
  }

  /** 標記讀完，回傳是否為「首次點亮」 */
  markAsRead(articleId: number): boolean {
    if (!articleId || articleId < 0 || this.isRead(articleId)) {
      return false;
    }

    const next = new Set(this.$$readIds());
    next.add(articleId);
    this.$$readIds.set(next);
    this.#saveToLocal(next);

    if (this.#globalStore.isLoggedIn()) {
      this.#apiReadingProgressService.syncReadAiArticles([articleId]).subscribe({
        error: error => console.error('sync read record failed', error)
      });
    }

    return true;
  }

  #syncWithBackend(): void {
    const localIds = Array.from(this.$$readIds());
    this.#apiReadingProgressService.syncReadAiArticles(localIds).subscribe({
      next: mergedIds => {
        const merged = new Set(mergedIds);
        this.$$readIds.set(merged);
        this.#saveToLocal(merged);
      },
      error: error => console.error('sync reading progress failed', error)
    });
  }

  #loadFromLocal(): Set<number> {
    const raw = this.#storageService.getLocalItem(READ_ARTICLES_KEY);
    if (!raw) return new Set();
    try {
      const ids = JSON.parse(raw);
      return new Set(Array.isArray(ids) ? ids.filter((id: unknown) => typeof id === 'number') : []);
    } catch {
      return new Set();
    }
  }

  #saveToLocal(ids: Set<number>): void {
    this.#storageService.setLocalItem(READ_ARTICLES_KEY, JSON.stringify(Array.from(ids)));
  }
}
