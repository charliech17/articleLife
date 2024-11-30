import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  #platformId = inject(PLATFORM_ID);

  setLocalItem(key: string, value: any) {
    if (isPlatformBrowser(this.#platformId)) {
      localStorage.setItem(key, value);
    }
  }

  getLocalItem(key: string) {
    if (isPlatformBrowser(this.#platformId)) {
      return localStorage.getItem(key);
    }

    return null;
  }

  removeLocalItem(key: string) {
    if (isPlatformBrowser(this.#platformId)) {
      localStorage.removeItem(key);
    }
  }

  clearLocal() {
    if (isPlatformBrowser(this.#platformId)) {
      localStorage.clear();
    }
  }

  setSessionItem(key: ESessionStorageItems, value: any) {
    if (isPlatformBrowser(this.#platformId)) {
      sessionStorage.setItem(key, value);
    }
  }

  getSessionItem(key: ESessionStorageItems) {
    if (isPlatformBrowser(this.#platformId)) {
      return sessionStorage.getItem(key);
    }

    return null;
  }

  removeSessionItem(key: ESessionStorageItems) {
    if (isPlatformBrowser(this.#platformId)) {
      sessionStorage.removeItem(key);
    }
  }

  clearSession() {
    if (isPlatformBrowser(this.#platformId)) {
      sessionStorage.clear();
    }
  }
}

export enum ESessionStorageItems {
  homeYPosition = 'home-y-position',
  articleYPosition = 'article-y-position',
}
