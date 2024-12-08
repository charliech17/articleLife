import { isPlatformServer } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { catchError, of, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        if (isPlatformServer(platformId)) {
          // 若是服務端，去獲取需要權限的資料，會報錯，這邊是預期的行為，不需要處理
          console.log('Server side error:', err.message);
          return of(err.message);
        }

        // show whether go to login dialog
      }

      return throwError(() => err);
    }),
  );
};
