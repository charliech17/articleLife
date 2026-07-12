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

  #isInitialized = false;

  initGoogle(onCredential: (credential: string) => void): Promise<void> {
    if (this.#isInitialized) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      // 註冊全域 callback 處理登入結果
      (window as any).handleGoogleCredential = (res: any) => {
        this.#zone.run(() => onCredential(res.credential));
      };

      // 註冊全域初始化回呼函式 (Callback)，確保 Google 腳本載入完成時立刻執行初始化。
      // 此設定可解決因 ITP (Intelligent Tracking Prevention) 觸發全頁面跳轉後，
      // Angular 啟動延遲導致錯失 Google 回傳憑證的問題。
      (window as any).onGoogleLibraryLoad = () => {
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (window as any).handleGoogleCredential,
          itp_support: true,
          use_fedcm_for_prompt: false,
        });
        this.#isInitialized = true;
        resolve();
      };

      this.#loadScript().catch(err => console.error(err));
    });
  }

  renderButton(container: HTMLElement, onCredential: (credential: string) => void): void {
    if (!isPlatformBrowser(this.#platformId)) {
      return; 
    }

    // 檢查是否為 iOS Chrome 或 iOS 裝置
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    
    // 針對 iOS 裝置使用自訂的點擊攔截與標準 OAuth2 跳轉流程。
    // 原因：Google Identity Services (GIS) 套件在 iOS Chrome 等瀏覽器上，
    // 會因底層防追蹤機制或 Deep Link 處理錯誤而導致瀏覽器分頁崩潰。
    if (isIOS) {
      this.initGoogle(onCredential).then(() => {
        // 建立一個 Wrapper 容器來放置 Google 按鈕，設定 relative 定位以容納絕對定位的遮罩
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        container.innerHTML = ''; // 清空原本內容
        container.appendChild(wrapper);

        // 渲染外觀
        google.accounts.id.renderButton(wrapper, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: 280,
        });

        // 建立透明遮罩覆蓋於 Google 渲染出的 iframe 登入按鈕上方。
        // 由於跨網域 iframe 的點擊事件不會向上傳遞 (Event Bubbling)，
        // 必須透過覆蓋此遮罩來攔截使用者的點擊事件，藉此觸發自訂的 OAuth2 跳轉。
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.zIndex = '9999';
        overlay.style.cursor = 'pointer';
        
        overlay.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.redirectLogin();
        });
        
        wrapper.appendChild(overlay);
      });
      return;
    }

    this.initGoogle(onCredential).then(() => {
      google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width: 280,
      });
    });
  }

  /**
   * 執行標準 OAuth2 隱含授權流程跳轉。
   * 此方法具有最高相容性，可完全避開 ITP 第三方 Cookie 阻擋及 iOS 瀏覽器崩潰等問題。
   */
  redirectLogin(): void {
    const clientId = environment.googleClientId;
    // 取得當前的完整路徑 (去除參數與 hash)，確保應用程式佈署於子目錄時亦能正確計算 redirect_uri
    const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
    const scope = encodeURIComponent('email profile openid');
    // 附加 prompt=select_account 參數，強制 Google 在跳轉後顯示帳號選擇畫面
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=id_token&scope=${scope}&prompt=select_account&nonce=${Math.random().toString(36).substring(7)}`;
    window.location.href = url;
  }

  #loadScript(): Promise<void> {
    if (this.#scriptLoaded) {
      return this.#scriptLoaded;
    }

    this.#scriptLoaded = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Google 腳本載入完成後會自動觸發全域的 onGoogleLibraryLoad 函式，
        // 這裡無需手動觸發，以避免重複初始化 (Double Initialization) 導致的非預期錯誤。
      };
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });

    return this.#scriptLoaded;
  }
}
