import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  setLocalItem(key: string, value: any) {
    localStorage.setItem(key, value);
  }

  getLocalItem(key: string) {
    return localStorage.getItem(key);
  }

  removeLocalItem(key: string) {
    localStorage.removeItem(key);
  }

  clearLocal() {
    localStorage.clear();
  }

  setSessionItem(key: ESessionStorageItems, value: any) {
    sessionStorage.setItem(key, value);
  }

  getSessionItem(key: ESessionStorageItems) {
    return sessionStorage.getItem(key);
  }

  removeSessionItem(key: ESessionStorageItems) {
    sessionStorage.removeItem(key);
  }

  clearSession() {
    sessionStorage.clear();
  }
}

export enum ESessionStorageItems {
  homeYPosition = 'home-y-position',
  articleYPosition = 'article-y-position',
}
