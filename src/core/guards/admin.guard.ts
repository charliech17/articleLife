import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GlobalStore } from '../../shared/stores/global.store';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const globalStore = inject(GlobalStore);
  const router = inject(Router);

  // 等待 globalStore 初始化完成（包含 API 請求結束）
  return toObservable(globalStore.hasStoreFinishedInit).pipe(
    filter(isInit => isInit),
    take(1),
    map(() => {
      if (globalStore.userInfo().isAdmin) {
        return true;
      }
      return router.parseUrl('/home');
    })
  );
};
