import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StateStorageService {
  #platformId = inject(PLATFORM_ID);

  private previousUrlKey = 'previousUrl';
  private authenticationKey = 'jhi-authenticationToken';
  private localeKey = 'locale';

  constructor() {}

  storeUrl(url: string): void {
    if (isPlatformBrowser(this.#platformId)) {
      sessionStorage.setItem(this.previousUrlKey, JSON.stringify(url));
    }
  }

  getUrl(): string | null {
    if (isPlatformBrowser(this.#platformId)) {
      const previousUrl = sessionStorage.getItem(this.previousUrlKey);
      return previousUrl ? (JSON.parse(previousUrl) as string | null) : previousUrl;
    }
    return '';
  }

  clearUrl(): void {
    if (isPlatformBrowser(this.#platformId)) {
      sessionStorage.removeItem(this.previousUrlKey);
    }
  }

  storeAuthenticationToken(authenticationToken: string, rememberMe: boolean): void {
    authenticationToken = JSON.stringify(authenticationToken);
    this.clearAuthenticationToken();
    if (rememberMe) {
      localStorage.setItem(this.authenticationKey, authenticationToken);
    } else {
      sessionStorage.setItem(this.authenticationKey, authenticationToken);
    }
  }

  getAuthenticationToken(): string | null {
    if (isPlatformBrowser(this.#platformId)) {
      const authenticationToken = localStorage.getItem(this.authenticationKey) ?? sessionStorage.getItem(this.authenticationKey);
      return authenticationToken ? (JSON.parse(authenticationToken) as string | null) : authenticationToken;
    }
    return '';
  }

  clearAuthenticationToken(): void {
    if (isPlatformBrowser(this.#platformId)) {
      sessionStorage.removeItem(this.authenticationKey);
      localStorage.removeItem(this.authenticationKey);
    }
  }

  storeLocale(locale: string): void {
    if (isPlatformBrowser(this.#platformId)) {
      sessionStorage.setItem(this.localeKey, locale);
    }
  }

  getLocale(): string | null {
    if (isPlatformBrowser(this.#platformId)) {
      return sessionStorage.getItem(this.localeKey);
    }
    return '';
  }

  clearLocale(): void {
    if (isPlatformBrowser(this.#platformId)) {
      sessionStorage.removeItem(this.localeKey);
    }
  }
}
