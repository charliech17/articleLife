import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { EnvService } from '../../services/env.service';

export const ApiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const envService = inject(EnvService);

  if (req.url.startsWith('api/')) {
    const apiReq = req.clone({ url: `${envService.baseApiUrl}/${req.url}`, withCredentials: true });
    return next(apiReq);
  }

  return next(req);
};
