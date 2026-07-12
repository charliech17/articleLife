import { inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../env/env';

declare const google: any;

/**
 * 載入 Google Identity Services 並渲染「使用 Google 繼續」按鈕。
 * 按鈕點擊後由 Google 回傳 ID token (credential)，再交給後端驗證。
 */
@Injectable({ providedIn: 'root' })
export class GoogleSigninService {
  #platformId = inject(PLATFORM_ID);
  #zone = inject(NgZone);
  #scriptLoaded?: Promise<void>;

  renderButton(container: HTMLElement, onCredential: (credential: string) => void): void {
    if (!isPlatformBrowser(this.#platformId)) {
      return; // SSR 環境不載入
    }

    this.#loadScript()
      .then(() => {
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (res: { credential: string }) => this.#zone.run(() => onCredential(res.credential)),
        });
        google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: 280,
        });
      })
      .catch(err => console.error(err));
  }

  #loadScript(): Promise<void> {
    if (this.#scriptLoaded) {
      return this.#scriptLoaded;
    }

    this.#scriptLoaded = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });

    return this.#scriptLoaded;
  }
}
