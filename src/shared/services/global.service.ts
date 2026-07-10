import { Injectable, inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiAuthService } from './api/api-auth/auth.service';
import { GlobalStore } from '../stores/global.store';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GlobalService {
  aiChatTrigger = new Subject<{ text: string, autoSend?: boolean } | string>();
  #apiAuthService = inject(ApiAuthService);
  #globalStore = inject(GlobalStore);
  #platformId = inject(PLATFORM_ID);
  #router = inject(Router);
  #snackBar = inject(MatSnackBar);
  #checkInterval: any;
  #isFetching = false;
  private readonly FETCH_COOLDOWN = 60000; // 60 秒
  private readonly STORAGE_KEY = 'last_user_fetch_time';

  #ngZone = inject(NgZone);

  constructor() {
    if (isPlatformBrowser(this.#platformId)) {
      this.callApiWhenReloadOrLogin();
      
      this.#ngZone.runOutsideAngular(() => {
        // 每 5 秒檢查一次是否需要打 API
        this.#checkInterval = setInterval(() => {
          this.checkAndFetchUser();
        }, 5000);
        
        // 當使用者回到網頁時，如果距離上次打 API 已經超過 10 秒，就馬上打一次
        window.addEventListener('focus', () => {
          const lastFetchTime = parseInt(sessionStorage.getItem(this.STORAGE_KEY) || '0', 10);
          if (Date.now() - lastFetchTime > 10000) { 
            this.#ngZone.run(() => this.callApiWhenReloadOrLogin());
          }
        });
      });
    } else {
      this.#globalStore.setStoreFinishedInit();
    }
  }

  private checkAndFetchUser(): void {
    // 只有在已登入的狀態下，才需要每 60 秒自動更新
    if (!this.#globalStore.isLoggedIn()) {
      return;
    }

    const lastFetchTime = parseInt(sessionStorage.getItem(this.STORAGE_KEY) || '0', 10);
    // 如果距離上次打 API 已經超過 60 秒，就打 API
    if (Date.now() - lastFetchTime >= this.FETCH_COOLDOWN) {
      this.#ngZone.run(() => this.callApiWhenReloadOrLogin());
    }
  }

  callApiWhenReloadOrLogin(): void {
    if (!isPlatformBrowser(this.#platformId) || this.#isFetching) {
      return;
    }

    this.#isFetching = true;
    
    // 先標記時間，避免短時間內重複觸發
    sessionStorage.setItem(this.STORAGE_KEY, Date.now().toString());

    this.#apiAuthService.getUserInfo().subscribe({
      next: res => {
        this.#isFetching = false;
        this.#globalStore.setUserInfo(res);
        this.#globalStore.setStoreFinishedInit();
        
        // 成功後再精確更新一次時間
        if (res) {
          sessionStorage.setItem(this.STORAGE_KEY, Date.now().toString());
        }
      },
      error: err => {
        this.#isFetching = false;
        
        // 如果原本是登入狀態，但現在 API 失敗，代表被登出或 Token 失效
        if (this.#globalStore.isLoggedIn()) {
          this.#globalStore.clearUserInfo();
          
          this.#router.navigate(['/'], { replaceUrl: true }).then(() => {
            this.#snackBar.open('您的登入狀態已失效，請重新登入！', '關閉', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          });
        }

        this.#globalStore.setStoreFinishedInit();
      },
    });
  }
}
