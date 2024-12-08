import { Injectable, inject } from '@angular/core';
import { ApiAuthService } from './api/api-auth/auth.service';
import { GlobalStore } from '../stores/global.store';

@Injectable({ providedIn: 'root' })
export class GlobalService {
  #apiAuthService = inject(ApiAuthService);
  #globalStore = inject(GlobalStore);

  constructor() {
    this.callApiWhenReloadOrLogin();
  }

  callApiWhenReloadOrLogin(): void {
    this.#apiAuthService.getUserInfo().subscribe({
      next: res => {
        this.#globalStore.setUserInfo(res);
        this.#globalStore.setStoreFinishedInit();
      },
      error: err => {
        this.#globalStore.setStoreFinishedInit();
      },
    });
  }
}
